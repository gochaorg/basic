"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pointer_1 = require("./Pointer");
var Lexer_1 = require("./Lexer");
var RemStatement_1 = require("./RemStatement");
var Statements_1 = require("./Statements");
var OperatorExp_1 = require("./OperatorExp");
/**
 * Парсинг BASIC
 */
var Parser = /** @class */ (function () {
    /**
     * Конструктор
     * @param lexs лексемы
     */
    function Parser(lexs) {
        this.debug = false;
        this.ptr = new Pointer_1.Pointer(lexs);
    }
    /**
     * Конструктор
     * @param source исходный текст
     */
    Parser.create = function (source) {
        return new Parser(Lexer_1.parseBasicLexs(source));
    };
    Parser.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.debug) {
            console.log.apply(console, args);
        }
    };
    /**
     * statements ::= { statement }
     */
    Parser.prototype.statements = function () {
        var res = [];
        if (this.ptr.eof)
            return null;
        var total = this.ptr.entries.length;
        var tailEntries = this.ptr.gets(total - this.ptr.ptr);
        var lines = Lexer_1.filter(tailEntries).lines;
        var firstLex = null;
        var lastLex = null;
        for (var li = 0; li < lines.length; li++) {
            var lineLex = lines[li];
            if (firstLex == null && lineLex.length > 0) {
                firstLex = lineLex[0];
            }
            if (lineLex.length > 0) {
                lastLex = lineLex[lineLex.length - 1];
            }
            var lineParser = new Parser(lineLex);
            var lineStatement = lineParser.statement();
            if (lineStatement) {
                res.push(lineStatement);
            }
            else {
                throw new Error("can't parse line: " + lineLex);
            }
        }
        if (firstLex != null && lastLex != null) {
            return new Statements_1.SStatements(firstLex, lastLex, res);
        }
        return new Statements_1.SStatements(new Lexer_1.DummyLex(-1, -1), new Lexer_1.DummyLex(-1, -1), res);
    };
    /**
     * statement ::= remStatement
     */
    Parser.prototype.statement = function () {
        return this.remStatement();
    };
    /**
     * remStatement ::= SourceLineBeginLex RemLex
     *                | NumberLex RemLex
     *                | RemLex
     */
    Parser.prototype.remStatement = function () {
        if (this.ptr.eof)
            return null;
        var _a = this.ptr.gets(2), lex1 = _a[0], lex2 = _a[1];
        if (lex1 instanceof Lexer_1.SourceLineBeginLex && lex2 instanceof Lexer_1.RemLex) {
            this.ptr.move(2);
            return new RemStatement_1.SRemStatement(lex1, lex2, lex2);
        }
        if (lex1 instanceof Lexer_1.NumberLex && lex2 instanceof Lexer_1.RemLex) {
            this.ptr.move(2);
            return new RemStatement_1.SRemStatement(lex1.asSourceLine, lex2, lex2);
        }
        if (lex1 instanceof Lexer_1.RemLex) {
            this.ptr.move(1);
            return new RemStatement_1.IRemStatement(lex1, lex1, lex1);
        }
        return null;
    };
    /**
     * letStatement ::= SourceLineBeginLex StatementLex(LET)
     */
    Parser.prototype.letStatement = function () {
    };
    /**
     * expression ::= powExpression | bracketExpression
     */
    Parser.prototype.expression = function () {
        this.log('expression() ptr=', this.ptr.gets(3));
        var powExp = this.powExpression();
        if (powExp)
            return powExp;
        var brExp = this.bracketExpression();
        if (brExp)
            return brExp;
        return null;
    };
    /**
     * bracketExpression ::= '(' expression ')'
     */
    Parser.prototype.bracketExpression = function () {
        if (this.ptr.eof)
            return null;
        var leftBr = this.ptr.get(0);
        if (leftBr instanceof Lexer_1.KeyWordLex && leftBr.keyWord == '(') {
            this.ptr.push();
            this.ptr.move(1);
            var exp = this.expression();
            if (exp) {
                var rightBr = this.ptr.get(0);
                if (rightBr instanceof Lexer_1.KeyWordLex && rightBr.keyWord == ')') {
                    this.ptr.move(1);
                    this.ptr.drop();
                    return exp;
                }
            }
            this.ptr.pop();
        }
        return null;
    };
    /**
     * powExpression ::= mulExpression [ '^' expression ]
     */
    Parser.prototype.powExpression = function () {
        this.log('powExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.mulExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex &&
                (lx.keyWord == '^')) {
                this.ptr.move(1);
                var rightOp = this.expression();
                if (rightOp) {
                    this.ptr.drop();
                    return new OperatorExp_1.BinaryOpExpression(lx, leftOp, rightOp);
                }
            }
            else {
                this.ptr.drop();
                return leftOp;
            }
        }
        this.ptr.pop();
        return null;
    };
    /**
     * mulExpression ::= intDivExpression [ ( '*' | '/' ) expression ]
     */
    Parser.prototype.mulExpression = function () {
        this.log('mulExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.intDivExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex &&
                (lx.keyWord == '*' || lx.keyWord == '/')) {
                this.ptr.move(1);
                var rightOp = this.expression();
                if (rightOp) {
                    this.ptr.drop();
                    return new OperatorExp_1.BinaryOpExpression(lx, leftOp, rightOp);
                }
            }
            else {
                this.ptr.drop();
                return leftOp;
            }
        }
        this.ptr.pop();
        return null;
    };
    /**
     * intDivExpression ::= modExpression [ '\' expression ]
     */
    Parser.prototype.intDivExpression = function () {
        this.log('intDivExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.modExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex &&
                (lx.keyWord == '\\')) {
                this.ptr.move(1);
                var rightOp = this.expression();
                if (rightOp) {
                    this.ptr.drop();
                    return new OperatorExp_1.BinaryOpExpression(lx, leftOp, rightOp);
                }
            }
            else {
                this.ptr.drop();
                return leftOp;
            }
        }
        this.ptr.pop();
        return null;
    };
    /**
     * modExpression ::= plusExpression [ 'MOD' expression ]
     */
    Parser.prototype.modExpression = function () {
        this.log('modExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        // let unary = false
        // let unaryLx = this.ptr.get()
        // if( unaryLx instanceof OperatorLex && (unaryLx.keyWord=='-' || unaryLx.keyWord=='+')){
        //     this.ptr.move(1)
        //     unary = true
        // }
        var leftOp = this.plusExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex &&
                (lx.keyWord == 'MOD')) {
                this.ptr.move(1);
                var rightOp = this.expression();
                if (rightOp) {
                    this.ptr.drop();
                    var binOp = new OperatorExp_1.BinaryOpExpression(lx, leftOp, rightOp);
                    // if( unary ){
                    //     return new UnaryOpExpression(unaryLx as OperatorLex,binOp)
                    // }
                    return binOp;
                }
            }
            else {
                this.ptr.drop();
                // if( unary ){
                //     return new UnaryOpExpression(unaryLx as OperatorLex, leftOp)
                // }
                return leftOp;
            }
        }
        this.ptr.pop();
        return null;
    };
    /**
     * plusExpression ::= relationExpression [ ('+' | '-') expression ]
     */
    Parser.prototype.plusExpression = function () {
        this.log('plusExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.relationExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex &&
                (lx.keyWord == '+' || lx.keyWord == '-')) {
                this.ptr.move(1);
                var rightOp = this.expression();
                if (rightOp) {
                    this.ptr.drop();
                    return new OperatorExp_1.BinaryOpExpression(lx, leftOp, rightOp);
                }
            }
            else {
                this.ptr.drop();
                return leftOp;
            }
        }
        this.ptr.pop();
        return null;
    };
    //unaryExpression(){        
    //}
    /**
     * relationExpression ::= notExpression [ ('=', '<>', '><', '<', '>', '>=', '<=', '=>', '=<') expression ]
     */
    Parser.prototype.relationExpression = function () {
        this.log('relationExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.notExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex &&
                (lx.keyWord == '=' || lx.keyWord == '<>' ||
                    lx.keyWord == '><' || lx.keyWord == '<' || lx.keyWord == '>' ||
                    lx.keyWord == '<=' || lx.keyWord == '>=' ||
                    lx.keyWord == '=<' || lx.keyWord == '=>')) {
                this.ptr.move(1);
                var rightOp = this.expression();
                if (rightOp) {
                    this.ptr.drop();
                    return new OperatorExp_1.BinaryOpExpression(lx, leftOp, rightOp);
                }
            }
            else {
                this.ptr.drop();
                return leftOp;
            }
        }
        this.ptr.pop();
        return null;
    };
    /**
     * notExpression ::= ['NOT'] andExpression
     */
    Parser.prototype.notExpression = function () {
        this.log('notExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        var lx = this.ptr.get();
        if (lx instanceof Lexer_1.OperatorLex && lx.keyWord == 'NOT') {
            this.ptr.push();
            this.ptr.move(1);
            var exp = this.andExpression();
            if (exp) {
                this.ptr.drop();
                return new OperatorExp_1.UnaryOpExpression(lx, exp);
            }
            this.ptr.pop();
            return null;
        }
        return this.andExpression();
    };
    /**
     * andExpression ::= orExpression [ 'AND' expression ]
     */
    Parser.prototype.andExpression = function () {
        this.log('andExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.orExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.keyWord == 'AND') {
                this.ptr.move(1);
                var rightOp = this.expression();
                if (rightOp) {
                    this.ptr.drop();
                    return new OperatorExp_1.BinaryOpExpression(lx, leftOp, rightOp);
                }
            }
            else {
                this.ptr.drop();
                return leftOp;
            }
        }
        this.ptr.pop();
        return null;
    };
    /**
     * orExpression ::= xorExpression [ 'OR' expression ]
     */
    Parser.prototype.orExpression = function () {
        this.log('orExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.xorExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.keyWord == 'OR') {
                this.ptr.move(1);
                var rightOp = this.expression();
                if (rightOp) {
                    this.ptr.drop();
                    return new OperatorExp_1.BinaryOpExpression(lx, leftOp, rightOp);
                }
            }
            else {
                this.ptr.drop();
                return leftOp;
            }
        }
        this.ptr.pop();
        return null;
    };
    /**
     * xorExpression ::= eqvExpression [ 'XOR' expression ]
     */
    Parser.prototype.xorExpression = function () {
        this.log('xorExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.eqvExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.keyWord == 'XOR') {
                this.ptr.move(1);
                var rightOp = this.expression();
                if (rightOp) {
                    this.ptr.drop();
                    return new OperatorExp_1.BinaryOpExpression(lx, leftOp, rightOp);
                }
            }
            else {
                this.ptr.drop();
                return leftOp;
            }
        }
        this.ptr.pop();
        return null;
    };
    /**
     * eqvExpression ::= impExpression [ 'EQV' expression ]
     */
    Parser.prototype.eqvExpression = function () {
        this.log('eqvExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.impExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.keyWord == 'EQV') {
                this.ptr.move(1);
                var rightOp = this.expression();
                if (rightOp) {
                    this.ptr.drop();
                    return new OperatorExp_1.BinaryOpExpression(lx, leftOp, rightOp);
                }
            }
            else {
                this.ptr.drop();
                return leftOp;
            }
        }
        this.ptr.pop();
        return null;
    };
    /**
     * impExpression ::= [ '+' | '-' ] baseValueExpression [ 'IMP' expression ]
     */
    Parser.prototype.impExpression = function () {
        this.log('impExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var unary = false;
        var unaryLx = this.ptr.get();
        if (unaryLx instanceof Lexer_1.OperatorLex && (unaryLx.keyWord == '-' || unaryLx.keyWord == '+')) {
            this.ptr.move(1);
            unary = true;
        }
        var leftOp = this.baseValueExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.keyWord == 'IMP') {
                this.ptr.move(1);
                var rightOp = this.expression();
                if (rightOp) {
                    this.ptr.drop();
                    if (unary) {
                        return new OperatorExp_1.UnaryOpExpression(unaryLx, new OperatorExp_1.BinaryOpExpression(lx, leftOp, rightOp));
                    }
                    return new OperatorExp_1.BinaryOpExpression(lx, leftOp, rightOp);
                }
            }
            else {
                this.ptr.drop();
                if (unary) {
                    return new OperatorExp_1.UnaryOpExpression(unaryLx, leftOp);
                }
                return leftOp;
            }
        }
        this.ptr.pop();
        return null;
    };
    /**
     * baseValueExpression ::= constExpression | varRefExpression
     */
    Parser.prototype.baseValueExpression = function () {
        this.log('baseValueExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        var cexpr = this.constExpression();
        this.log('baseValueExpression() cexpr=', cexpr);
        if (cexpr) {
            this.log('baseValueExpression() res=', cexpr);
            return cexpr;
        }
        var vrefExp = this.varRefExpression();
        this.log('baseValueExpression() vrefExp=', vrefExp);
        if (vrefExp) {
            this.log('baseValueExpression() res=', vrefExp);
            return vrefExp;
        }
        return null;
    };
    /**
     * constExpression ::= NumberLex | StringLex
     */
    Parser.prototype.constExpression = function () {
        this.log('constExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        var lx = this.ptr.get();
        if (lx instanceof Lexer_1.NumberLex) {
            this.ptr.move(1);
            return new OperatorExp_1.ConstExpression(lx, lx.value);
        }
        if (lx instanceof Lexer_1.StringLex) {
            this.ptr.move(1);
            return new OperatorExp_1.ConstExpression(lx, lx.value);
        }
        return null;
    };
    /**
     * varRefExpression ::= IDLex
     */
    Parser.prototype.varRefExpression = function () {
        this.log('varRefExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        var lx = this.ptr.get();
        this.log('varRefExpression() lx=', lx);
        if (lx instanceof Lexer_1.IDLex) {
            this.log('varRefExpression() succ', lx);
            this.ptr.move(1);
            return new OperatorExp_1.VarRefExpression(lx);
        }
        return null;
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=Parser.js.map