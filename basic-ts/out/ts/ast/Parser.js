"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pointer_1 = require("./Pointer");
var Lexer_1 = require("./Lexer");
var RemStatement_1 = require("./RemStatement");
var Statements_1 = require("./Statements");
var OperatorExp_1 = require("./OperatorExp");
var LetStatement_1 = require("./LetStatement");
var RunStatement_1 = require("./RunStatement");
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
        this.log("statements() lines:", lines);
        for (var li = 0; li < lines.length; li++) {
            var lineLex = lines[li];
            if (firstLex == null && lineLex.length > 0) {
                firstLex = lineLex[0];
            }
            if (lineLex.length > 0) {
                lastLex = lineLex[lineLex.length - 1];
            }
            this.log("statements() line:", lineLex);
            var lineParser = new Parser(lineLex);
            lineParser.debug = this.debug;
            while (!lineParser.ptr.eof) {
                var lineStatement = lineParser.statement();
                if (lineStatement) {
                    res.push(lineStatement);
                }
                else {
                    throw new Error("can't parse line: " + JSON.stringify(lineParser.ptr.gets(5)));
                }
            }
        }
        if (firstLex != null && lastLex != null) {
            return new Statements_1.Statements(firstLex, lastLex, res);
        }
        return new Statements_1.Statements(new Lexer_1.DummyLex(-1, -1), new Lexer_1.DummyLex(-1, -1), res);
    };
    /**
     * statement ::= remStatement
     *             | letStatement
     *             | runStatement
     */
    Parser.prototype.statement = function () {
        this.log('statement() ptr=', this.ptr.gets(3));
        var remStmt = this.remStatement();
        if (remStmt)
            return remStmt;
        var letStmt = this.letStatement();
        if (letStmt)
            return letStmt;
        var runStmt = this.runStatement();
        if (runStmt)
            return runStmt;
        return null;
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
            return new RemStatement_1.RemStatement(lex1, lex2, lex2);
        }
        if (lex1 instanceof Lexer_1.NumberLex && lex2 instanceof Lexer_1.RemLex) {
            this.ptr.move(2);
            return new RemStatement_1.RemStatement(lex1.asSourceLine, lex2, lex2);
        }
        if (lex1 instanceof Lexer_1.RemLex) {
            this.ptr.move(1);
            return new RemStatement_1.RemStatement(lex1, lex1, lex1);
        }
        return null;
    };
    /**
     * letStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                  StatementLex(LET) IDLex OperatorLex(=) expression
     */
    Parser.prototype.letStatement = function () {
        if (this.ptr.eof)
            return null;
        var lineNum = undefined;
        var lineNumLex = this.ptr.get(0);
        var off = 0;
        if (lineNumLex instanceof Lexer_1.SourceLineBeginLex
            || lineNumLex instanceof Lexer_1.NumberLex) {
            if (lineNumLex instanceof Lexer_1.SourceLineBeginLex) {
                lineNum = lineNumLex.line;
            }
            if (lineNumLex instanceof Lexer_1.NumberLex) {
                lineNum = lineNumLex.value;
            }
            off = 1;
        }
        var lexLet = this.ptr.get(off);
        if (lexLet instanceof Lexer_1.StatementLex &&
            lexLet.keyWord == 'LET') {
            var _a = this.ptr.fetch(off + 1, 2), lexId = _a[0], lexAssign = _a[1];
            if (lexAssign instanceof Lexer_1.OperatorLex && lexAssign.keyWord == '='
                && lexId instanceof Lexer_1.IDLex) {
                // parsing...
                this.ptr.push();
                var begin = this.ptr.get() || lexLet;
                this.ptr.move(off + 3);
                var exp = this.expression();
                if (exp) {
                    this.ptr.drop();
                    var end = exp.rightTreeLex || begin;
                    if (lineNum) {
                        return new LetStatement_1.LetStatement(begin, end, lexId, exp);
                    }
                    else {
                        return new LetStatement_1.LetStatement(begin, end, lexId, exp);
                    }
                }
                else {
                    // syntax error
                    this.ptr.pop();
                    return null;
                }
            }
            else {
                // syntax error
                return null;
            }
        }
        return null;
    };
    /**
     * runStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                  StatementLex(RUN) [lineNumber : NumberLex]
     */
    Parser.prototype.runStatement = function () {
        if (this.ptr.eof)
            return null;
        this.log('runStatement() ptr=', this.ptr.gets(3));
        var lineNum = undefined;
        var lineNumLex = this.ptr.get(0);
        var off = 0;
        if (lineNumLex instanceof Lexer_1.SourceLineBeginLex
            || lineNumLex instanceof Lexer_1.NumberLex) {
            if (lineNumLex instanceof Lexer_1.SourceLineBeginLex) {
                lineNum = lineNumLex.line;
            }
            if (lineNumLex instanceof Lexer_1.NumberLex) {
                lineNum = lineNumLex.value;
            }
            off = 1;
        }
        var runLex = this.ptr.get(off);
        if (runLex instanceof Lexer_1.StatementLex &&
            runLex.keyWord == 'RUN') {
            this.log('runStatement() RUN');
            var runLineLex = this.ptr.get(off + 1);
            if (runLineLex instanceof Lexer_1.NumberLex) {
                off += 2;
                this.ptr.move(off);
                this.log('runStatement() move ', off, { eof: this.ptr.eof,
                    gets3: this.ptr.gets(3)
                });
                return new RunStatement_1.RunStatement(lineNumLex || runLex, runLineLex, runLineLex);
            }
            off += 1;
            this.ptr.move(off);
            return new RunStatement_1.RunStatement(lineNumLex || runLex, runLex);
        }
        return null;
    };
    /**
     * expression ::= impExpression | bracketExpression
     */
    Parser.prototype.expression = function () {
        this.log('expression() ptr=', this.ptr.gets(3));
        var powExp = this.impExpression();
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
     * impExpression ::= eqvExpression [ 'IMP' eqvExpression ]
     */
    Parser.prototype.impExpression = function () {
        this.log('impExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        // let unary = false
        // let unaryLx = this.ptr.get()
        // if( unaryLx instanceof OperatorLex && (unaryLx.keyWord=='-' || unaryLx.keyWord=='+')){
        //     this.ptr.move(1)
        //     unary = true
        // }
        var leftOp = this.eqvExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.imp) {
                this.ptr.move(1);
                var rightOp = this.eqvExpression();
                if (rightOp) {
                    this.ptr.drop();
                    // if( unary ){
                    //     return new UnaryOpExpression(
                    //         unaryLx as OperatorLex,
                    //         new BinaryOpExpression(lx,leftOp,rightOp)
                    //     )
                    // }
                    return new OperatorExp_1.BinaryOpExpression(lx, leftOp, rightOp);
                }
            }
            else {
                this.ptr.drop();
                // if( unary ){
                // return new UnaryOpExpression(
                //     unaryLx as OperatorLex,
                //     leftOp
                // )
                // }               
                return leftOp;
            }
        }
        this.ptr.pop();
        return null;
    };
    /**
     * eqvExpression ::= xorExpression [ 'EQV' xorExpression ]
     */
    Parser.prototype.eqvExpression = function () {
        this.log('eqvExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.xorExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.eqv) {
                this.ptr.move(1);
                var rightOp = this.xorExpression();
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
     * xorExpression ::= orExpression [ 'XOR' orExpression ]
     */
    Parser.prototype.xorExpression = function () {
        this.log('xorExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.orExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.xor) {
                this.ptr.move(1);
                var rightOp = this.orExpression();
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
     * orExpression ::= andExpression [ 'OR' andExpression ]
     */
    Parser.prototype.orExpression = function () {
        this.log('orExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.andExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.or) {
                this.ptr.move(1);
                var rightOp = this.andExpression();
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
     * andExpression ::= notExpression [ 'AND' notExpression ]
     */
    Parser.prototype.andExpression = function () {
        this.log('andExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.notExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.and) {
                this.ptr.move(1);
                var rightOp = this.notExpression();
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
     * notExpression ::= ['NOT'] relationExpression
     */
    Parser.prototype.notExpression = function () {
        this.log('notExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        var lx = this.ptr.get();
        if (lx instanceof Lexer_1.OperatorLex && lx.not) {
            this.ptr.push();
            this.ptr.move(1);
            var exp = this.relationExpression();
            if (exp) {
                this.ptr.drop();
                return new OperatorExp_1.UnaryOpExpression(lx, exp);
            }
            this.ptr.pop();
            return null;
        }
        return this.relationExpression();
    };
    /**
     * relationExpression ::= plusExpression [ ('=', '<>', '><', '<', '>', '>=', '<=', '=>', '=<') plusExpression ]
     */
    Parser.prototype.relationExpression = function () {
        this.log('relationExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.plusExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.ordReleation) {
                this.ptr.move(1);
                var rightOp = this.plusExpression();
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
     * plusExpression ::= modExpression [ ('+' | '-') modExpression ]
     */
    Parser.prototype.plusExpression = function () {
        this.log('plusExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.modExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && (lx.plus || lx.minus)) {
                this.ptr.move(1);
                var rightOp = this.modExpression();
                this.log("plusExpression() right=", rightOp);
                if (rightOp) {
                    this.ptr.drop();
                    this.log("plusExpression() succ=", lx.keyWord, leftOp, rightOp);
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
     * modExpression ::= intDivExpression [ 'MOD' intDivExpression ]
     */
    Parser.prototype.modExpression = function () {
        this.log('modExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.intDivExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.mod) {
                this.ptr.move(1);
                var rightOp = this.intDivExpression();
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
                return leftOp;
            }
        }
        this.ptr.pop();
        return null;
    };
    /**
     * intDivExpression ::= mulExpression [ '\' mulExpression ]
     */
    Parser.prototype.intDivExpression = function () {
        this.log('intDivExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.mulExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.idiv) {
                this.ptr.move(1);
                var rightOp = this.mulExpression();
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
     * mulExpression ::= powExpression [ ( '*' | '/' ) powExpression ]
     */
    Parser.prototype.mulExpression = function () {
        this.log('mulExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.powExpression();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && (lx.mult || lx.div)) {
                this.ptr.move(1);
                var rightOp = this.powExpression();
                this.log("mulExpression() rightOp=" + rightOp);
                if (rightOp) {
                    this.ptr.drop();
                    this.log("mulExpression() succ=", lx.keyWord, leftOp, rightOp);
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
     * powExpression ::= signedAtom [ '^' signedAtom ]
     */
    Parser.prototype.powExpression = function () {
        this.log('powExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        // let unary = false
        // let unaryLx = this.ptr.get()
        // if( unaryLx instanceof OperatorLex && (unaryLx.keyWord=='-' || unaryLx.keyWord=='+')){
        //     this.ptr.move(1)
        //     unary = true
        // }
        var leftOp = this.signedAtom();
        if (leftOp) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.pow) {
                this.ptr.move(1);
                var rightOp = this.signedAtom();
                if (rightOp) {
                    this.ptr.drop();
                    // if( unary ){
                    //     return new UnaryOpExpression(
                    //         unaryLx as OperatorLex,
                    //         new BinaryOpExpression(lx,leftOp,rightOp)
                    //     )
                    // }
                    return new OperatorExp_1.BinaryOpExpression(lx, leftOp, rightOp);
                }
            }
            else {
                this.ptr.drop();
                // if( unary ){
                //     return new UnaryOpExpression(
                //         unaryLx as OperatorLex,
                //         leftOp
                //     )
                // }
                return leftOp;
            }
        }
        this.ptr.pop();
        return null;
    };
    /**
     * signedAtom ::= [ '+' | '-' ] atom
     */
    Parser.prototype.signedAtom = function () {
        this.log('signedAtom() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var unary = false;
        var unaryLx = this.ptr.get();
        if (unaryLx instanceof Lexer_1.OperatorLex && (unaryLx.keyWord == '-' || unaryLx.keyWord == '+')) {
            this.ptr.move(1);
            unary = true;
        }
        var atom = this.atom();
        if (atom) {
            this.ptr.drop();
            if (unary) {
                return new OperatorExp_1.UnaryOpExpression(unaryLx, atom);
            }
            return atom;
        }
        this.ptr.pop();
        return null;
    };
    /**
     * atom ::= '(' expression ')'
     *        | baseValueExpression
     */
    Parser.prototype.atom = function () {
        this.log('atom() ptr=', this.ptr.gets(3));
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
        return this.baseValueExpression();
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
            return new OperatorExp_1.LiteralExpression(lx, lx.value);
        }
        if (lx instanceof Lexer_1.StringLex) {
            this.ptr.move(1);
            return new OperatorExp_1.LiteralExpression(lx, lx.value);
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