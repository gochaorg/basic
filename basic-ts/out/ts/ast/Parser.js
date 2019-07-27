"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pointer_1 = require("./Pointer");
var Lexer_1 = require("./Lexer");
var RemStatement_1 = require("./RemStatement");
var Statements_1 = require("./Statements");
var OperatorExp_1 = require("./OperatorExp");
var LetStatement_1 = require("./LetStatement");
var RunStatement_1 = require("./RunStatement");
var GotoStatement_1 = require("./GotoStatement");
var IfStatement_1 = require("./IfStatement");
var GoSubStatement_1 = require("./GoSubStatement");
var ReturnStatement_1 = require("./ReturnStatement");
var PrintStatement_1 = require("./PrintStatement");
/**
 * Опции парсера
 */
var Options = /** @class */ (function () {
    function Options() {
        /**
         * парсинг statement с учетом номера строки
         */
        this.tryLineNum = true;
    }
    /**
     * Клонирование
     */
    Options.prototype.clone = function (conf) {
        var c = new Options();
        c.tryLineNum = this.tryLineNum;
        if (conf) {
            conf(c);
        }
        return c;
    };
    return Options;
}());
exports.Options = Options;
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
        /**
         * Опции
         */
        this.options = new Options();
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
     *             | gotoStatement
     *             | ifStatement
     *             | gosubStatement
     *             | returnStatement
     *             | printStatement
     */
    Parser.prototype.statement = function (opts) {
        if (!opts) {
            opts = this.options;
        }
        this.log('statement() ptr=', this.ptr.gets(3));
        var remStmt = this.remStatement(opts);
        if (remStmt)
            return remStmt;
        var letStmt = this.letStatement(opts);
        if (letStmt)
            return letStmt;
        var runStmt = this.runStatement(opts);
        if (runStmt)
            return runStmt;
        var gotoStmt = this.gotoStatement(opts);
        if (gotoStmt)
            return gotoStmt;
        var ifStmt = this.ifStatement(opts);
        if (ifStmt)
            return ifStmt;
        var gosubStmt = this.gosubStatement(opts);
        if (gosubStmt)
            return gosubStmt;
        var returnStmt = this.returnStatement(opts);
        if (returnStmt)
            return returnStmt;
        var printStmt = this.printStatement(opts);
        if (printStmt)
            return printStmt;
        return null;
    };
    /**
     * Проверка если текущая лексема обозначает начало нумерованной строки,
     * то лексема и номер строки передается в функцию,
     * а указатель смещается к след лексеме.
     *
     * Функция модет вернуть null, тогда будет восстановлена позиция
     * @param proc функция принимающая номер строки
     */
    Parser.prototype.matchLine = function (proc) {
        var lineNum = undefined;
        var lineNumLex = this.ptr.get(0);
        if ((lineNumLex instanceof Lexer_1.SourceLineBeginLex
            || lineNumLex instanceof Lexer_1.NumberLex)) {
            if (lineNumLex instanceof Lexer_1.SourceLineBeginLex) {
                lineNum = lineNumLex.line;
            }
            if (lineNumLex instanceof Lexer_1.NumberLex) {
                lineNum = lineNumLex.value;
            }
            if (lineNum) {
                this.ptr.push();
                this.ptr.move(1);
                var res = proc({ line: lineNum, lex: lineNumLex });
                if (res) {
                    this.ptr.drop();
                    return res;
                }
                this.ptr.pop();
            }
        }
        return null;
    };
    /**
     * remStatement ::= SourceLineBeginLex RemLex
     *                | NumberLex RemLex
     *                | RemLex
     */
    Parser.prototype.remStatement = function (opts) {
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        var _a = this.ptr.gets(2), lex1 = _a[0], lex2 = _a[1];
        if (lex1 instanceof Lexer_1.SourceLineBeginLex && lex2 instanceof Lexer_1.RemLex && opts.tryLineNum) {
            this.ptr.move(2);
            return new RemStatement_1.RemStatement(lex1, lex2, lex2);
        }
        if (lex1 instanceof Lexer_1.NumberLex && lex2 instanceof Lexer_1.RemLex && opts.tryLineNum) {
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
    Parser.prototype.letStatement = function (opts) {
        var _this = this;
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        // let lineNum : number | undefined = undefined
        // let lineNumLex = this.ptr.get(0)
        // let off = 0
        // if( opts.tryLineNum && 
        //     (  lineNumLex instanceof SourceLineBeginLex 
        //     || lineNumLex instanceof NumberLex 
        //     )
        // ){
        //     if( lineNumLex instanceof SourceLineBeginLex ){
        //         lineNum = lineNumLex.line
        //     }
        //     if( lineNumLex instanceof NumberLex ){
        //         lineNum = lineNumLex.value
        //     }
        //     off = 1
        // }
        var prod = function (arg) {
            _this.ptr.push();
            var lexLet = _this.ptr.get();
            if (lexLet instanceof Lexer_1.StatementLex && lexLet.LET) {
                _this.ptr.move(1);
            }
            else {
                _this.ptr.pop();
                return null;
            }
            var lexId = _this.ptr.get();
            if (lexId instanceof Lexer_1.IDLex) {
                var lxNext = _this.ptr.get(1);
                if (lxNext instanceof Lexer_1.OperatorLex && lxNext.keyWord == '=') {
                    _this.ptr.move(2);
                    var exp = _this.expression();
                    if (exp) {
                        var begin = arg ? arg.lex : lexLet;
                        var end = exp.rightTreeLex || begin;
                        _this.ptr.drop();
                        return new LetStatement_1.LetStatement(begin, end, lexId, exp);
                    }
                }
                // if( lxNext instanceof OperatorLex && lxNext.arrBrOpen ){
                //     this.ptr.move(2)
                //     //let exp
                // }
            }
            _this.ptr.pop();
            return null;
        };
        if (opts.tryLineNum) {
            return this.matchLine(prod) || prod();
        }
        else {
            return prod();
        }
        // let lexLet = this.ptr.get(off)
        // if( lexLet instanceof StatementLex && 
        //     lexLet.LET
        // ){
        //     let [ lexId, lxNext ] = this.ptr.fetch(off+1,2)
        //     if( lxNext instanceof OperatorLex && lxNext.keyWord == '=' 
        //     &&  lexId instanceof IDLex
        //     ){
        //         // parsing...
        //         this.ptr.push()
        //         let begin = this.ptr.get() || lexLet
        //         this.ptr.move(off+3)
        //         let exp = this.expression()
        //         if( exp ){
        //             this.ptr.drop()
        //             let end = exp.rightTreeLex || begin
        //             return new LetStatement(begin,end,lexId,exp)
        //         }else{
        //             // syntax error
        //             this.ptr.pop()
        //             return null
        //         }
        //     }else{
        //         // syntax error
        //         return null
        //     }
        // }
        // return null
    };
    /**
     * runStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                  StatementLex(RUN) [lineNumber : NumberLex]
     */
    Parser.prototype.runStatement = function (opts) {
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        this.log('runStatement() ptr=', this.ptr.gets(3));
        var lineNum = undefined;
        var lineNumLex = this.ptr.get(0);
        var off = 0;
        if (opts.tryLineNum &&
            (lineNumLex instanceof Lexer_1.SourceLineBeginLex
                || lineNumLex instanceof Lexer_1.NumberLex)) {
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
            runLex.RUN) {
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
     * gotoStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                   StatementLex(GOTO) lineNumber:NumberLex
     * @param opts опции компилятора
     */
    Parser.prototype.gotoStatement = function (opts) {
        var _this = this;
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        this.log('gotoStatement() ptr=', this.ptr.gets(3));
        var prod = function (linf) {
            var _a = _this.ptr.gets(2), gtLex = _a[0], gtLine = _a[1];
            if (gtLex instanceof Lexer_1.StatementLex
                && gtLex.GOTO
                && gtLine instanceof Lexer_1.NumberLex) {
                _this.ptr.move(2);
                return new GotoStatement_1.GotoStatement(linf ? linf.lex : gtLex, gtLine, gtLine);
            }
            return null;
        };
        if (opts.tryLineNum) {
            return this.matchLine(prod) || prod();
        }
        else {
            return prod();
        }
    };
    /**
     * gosubStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                   StatementLex(GOSUB) lineNumber:NumberLex
     * @param opts опции компилятора
     */
    Parser.prototype.gosubStatement = function (opts) {
        var _this = this;
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        this.log('gosubStatement() ptr=', this.ptr.gets(3));
        var prod = function (linf) {
            var _a = _this.ptr.gets(2), gtLex = _a[0], gtLine = _a[1];
            if (gtLex instanceof Lexer_1.StatementLex
                && gtLex.GOSUB
                && gtLine instanceof Lexer_1.NumberLex) {
                _this.ptr.move(2);
                return new GoSubStatement_1.GoSubStatement(linf ? linf.lex : gtLex, gtLine, gtLine);
            }
            return null;
        };
        if (opts.tryLineNum) {
            return this.matchLine(prod) || prod();
        }
        else {
            return prod();
        }
    };
    /**
     * returnStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                   StatementLex(RETURN) [lineNumber:NumberLex]
     * @param opts опции компилятора
     */
    Parser.prototype.returnStatement = function (opts) {
        var _this = this;
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        this.log('returnStatement() ptr=', this.ptr.gets(3));
        var prod = function (linf) {
            var gtLex = _this.ptr.gets(1)[0];
            if (gtLex instanceof Lexer_1.StatementLex
                && gtLex.RETURN) {
                _this.ptr.move(1);
                var gtLine = _this.ptr.fetch(0, 1)[0];
                if (gtLine instanceof Lexer_1.NumberLex) {
                    _this.ptr.move(1);
                    return new ReturnStatement_1.ReturnStatement(linf ? linf.lex : gtLex, gtLine, gtLine);
                }
                else {
                    return new ReturnStatement_1.ReturnStatement(linf ? linf.lex : gtLex, gtLine);
                }
            }
            return null;
        };
        if (opts.tryLineNum) {
            return this.matchLine(prod) || prod();
        }
        else {
            return prod();
        }
    };
    /**
     * ifStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                 StatementLex(IF) expression
     *                 StatementLex(THEN) statement
     *                 [StatementLex(ELSE) statement]
     * @param opts опции компилятора
     */
    Parser.prototype.ifStatement = function (opts) {
        var _this = this;
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        this.log('ifStatement() ptr=', this.ptr.gets(3));
        var prod = function (linf) {
            var ifLx = _this.ptr.get();
            _this.log("ifLx ", ifLx);
            if (!ifLx)
                return null;
            if (!(ifLx instanceof Lexer_1.StatementLex))
                return null;
            if (!(ifLx.IF))
                return null;
            _this.ptr.push();
            _this.ptr.move(1);
            var exp = _this.expression();
            if (!exp) {
                _this.ptr.pop();
                return null;
            }
            var thenLx = _this.ptr.get();
            if (thenLx instanceof Lexer_1.StatementLex && !thenLx.THEN) {
                _this.ptr.pop();
                return null;
            }
            _this.ptr.move(1);
            var conf = function (op) { op.tryLineNum = false; };
            var trueSt = _this.statement(opts ? opts.clone(conf) : _this.options.clone(conf));
            if (trueSt == null) {
                _this.ptr.pop();
                return null;
            }
            var elseLx = _this.ptr.get();
            var falseSt = null;
            if (elseLx instanceof Lexer_1.StatementLex && elseLx.ELSE) {
                _this.ptr.push();
                _this.ptr.move(1);
                falseSt = _this.statement(opts ? opts.clone(conf) : _this.options.clone(conf));
                if (falseSt) {
                    _this.ptr.drop();
                }
                else {
                    _this.ptr.pop();
                }
            }
            _this.ptr.drop();
            if (falseSt) {
                return new IfStatement_1.IfStatement(linf ? linf.lex : ifLx, falseSt ? falseSt.end : trueSt.end, exp, trueSt, falseSt);
            }
            return new IfStatement_1.IfStatement(linf ? linf.lex : ifLx, trueSt.end, exp, trueSt);
        };
        if (opts.tryLineNum) {
            return this.matchLine(prod) || prod();
        }
        else {
            return prod();
        }
    };
    /**
     * printStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                    StatementLex(PRINT) [expression {',' expression}]
     * @param opts опции компилятора
     */
    Parser.prototype.printStatement = function (opts) {
        var _this = this;
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        this.log('printStatement() ptr=', this.ptr.gets(3));
        var prod = function (linf) {
            var gtLex = _this.ptr.gets(1)[0];
            if (gtLex instanceof Lexer_1.StatementLex
                && gtLex.PRINT) {
                _this.ptr.move(1);
                var exps = [];
                var lastLex = gtLex;
                while (true) {
                    if (exps.length > 0) {
                        var lNext = _this.ptr.get();
                        if (!(lNext && lNext instanceof Lexer_1.OperatorLex && lNext.argDelim)) {
                            break;
                        }
                        else {
                            _this.ptr.move(1);
                        }
                    }
                    _this.ptr.push();
                    var exp = _this.expression();
                    if (exp) {
                        exps.push(exp);
                        if (exp.rightTreeLex) {
                            lastLex = exp.rightTreeLex;
                        }
                    }
                    else {
                        _this.ptr.pop();
                        if (exps.length > 0) {
                            //TODO here error report
                        }
                        break;
                    }
                }
                return new PrintStatement_1.PrintStatement(linf ? linf.lex : gtLex, lastLex, gtLex, exps);
            }
            return null;
        };
        if (opts.tryLineNum) {
            return this.matchLine(prod) || prod();
        }
        else {
            return prod();
        }
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
     * Парсинг циклической конструкции:
     * leftOp { operator rightExp }
     *
     * Проверяет что текущая лексема (operator) соответ указанной (accpetOperator),
     * и если это так, то производит анализ правого операнда (rightExp)
     * В результате создает последовательность (дерево растет в лево)
     * бинарных операторов
     * @param ruleName имя правила
     * @param leftOp левый уже вычесленный операнд
     * @param rightExp вычисление правого операнда
     * @param accpetOperator проверка оператора
     */
    Parser.prototype.binaryRepeatExpression = function (ruleName, leftOp, rightExp, accpetOperator) {
        var res = leftOp;
        while (true) {
            var lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && accpetOperator(lx)) {
                this.ptr.move(1);
                var rightOp = rightExp();
                this.log(ruleName + " right=", rightOp);
                if (rightOp) {
                    this.ptr.drop();
                    this.log(ruleName + " succ=", lx.keyWord, res, rightOp);
                    res = new OperatorExp_1.BinaryOpExpression(lx, res, rightOp);
                    lx = this.ptr.get();
                    if (lx instanceof Lexer_1.OperatorLex && accpetOperator(lx)) {
                        this.log(ruleName + " has right " + lx.keyWord);
                        this.ptr.push();
                        continue;
                    }
                    return res;
                }
                else {
                    this.ptr.pop();
                    return null;
                }
            }
            else {
                this.ptr.drop();
                return res;
            }
        }
    };
    /**
     * impExpression ::= eqvExpression [ { 'IMP' eqvExpression } ]
     */
    Parser.prototype.impExpression = function () {
        var _this = this;
        this.log('impExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.eqvExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('impExpression()', leftOp, function () { return _this.eqvExpression(); }, function (lx) { return lx.imp; });
        }
        this.ptr.pop();
        return null;
    };
    /**
     * eqvExpression ::= xorExpression [ 'EQV' xorExpression ]
     */
    Parser.prototype.eqvExpression = function () {
        var _this = this;
        this.log('eqvExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.xorExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('eqvExpression()', leftOp, function () { return _this.xorExpression(); }, function (lx) { return lx.eqv; });
        }
        this.ptr.pop();
        return null;
    };
    /**
     * xorExpression ::= orExpression [ { 'XOR' orExpression } ]
     */
    Parser.prototype.xorExpression = function () {
        var _this = this;
        this.log('xorExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.orExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('xorExpression()', leftOp, function () { return _this.orExpression(); }, function (lx) { return lx.xor; });
        }
        this.ptr.pop();
        return null;
    };
    /**
     * orExpression ::= andExpression [ { 'OR' andExpression } ]
     */
    Parser.prototype.orExpression = function () {
        var _this = this;
        this.log('orExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.andExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('orExpression()', leftOp, function () { return _this.andExpression(); }, function (lx) { return lx.or; });
        }
        this.ptr.pop();
        return null;
    };
    /**
     * andExpression ::= notExpression [ { 'AND' notExpression } ]
     */
    Parser.prototype.andExpression = function () {
        var _this = this;
        this.log('andExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.notExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('andExpression()', leftOp, function () { return _this.notExpression(); }, function (lx) { return lx.and; });
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
     * plusExpression ::= modExpression [ { ('+' | '-') modExpression } ]
     */
    Parser.prototype.plusExpression = function () {
        var _this = this;
        this.log('plusExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.modExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('plusExpression()', leftOp, function () { return _this.modExpression(); }, function (lx) { return lx.plus || lx.minus; });
        }
        this.ptr.pop();
        return null;
    };
    /**
     * modExpression ::= intDivExpression [ { 'MOD' intDivExpression } ]
     */
    Parser.prototype.modExpression = function () {
        var _this = this;
        this.log('modExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.intDivExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('modExpression()', leftOp, function () { return _this.intDivExpression(); }, function (lx) { return lx.mod; });
        }
        this.ptr.pop();
        return null;
    };
    /**
     * intDivExpression ::= mulExpression [ { '\' mulExpression } ]
     */
    Parser.prototype.intDivExpression = function () {
        var _this = this;
        this.log('intDivExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.mulExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('intDivExpression()', leftOp, function () { return _this.mulExpression(); }, function (lx) { return lx.idiv; });
        }
        this.ptr.pop();
        return null;
    };
    /**
     * mulExpression ::= powExpression [ { ( '*' | '/' ) powExpression } ]
     */
    Parser.prototype.mulExpression = function () {
        var _this = this;
        this.log('mulExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.powExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('mulExpression()', leftOp, function () { return _this.powExpression(); }, function (lx) { return lx.mult || lx.div; });
        }
        this.ptr.pop();
        return null;
    };
    /**
     * powExpression ::= signedAtom [ { '^' signedAtom } ]
     */
    Parser.prototype.powExpression = function () {
        var _this = this;
        this.log('powExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        var leftOp = this.signedAtom();
        if (leftOp) {
            return this.binaryRepeatExpression('powExpression()', leftOp, function () { return _this.signedAtom(); }, function (lx) { return lx.pow; });
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
     * baseValueExpression ::= constExpression
     *                       | varRefExpression '(' expression [{ ',' expression }] ')'
     *                       | varRefExpression
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
            var brOpen = this.ptr.get();
            if (brOpen instanceof Lexer_1.OperatorLex && brOpen.arrBrOpen) {
                var parseArrSucc = true;
                var indexExpression = [];
                this.ptr.push();
                this.ptr.move(1);
                while (true) {
                    var idxExp = this.expression();
                    if (idxExp) {
                        indexExpression.push(idxExp);
                    }
                    else {
                        this.ptr.pop();
                        parseArrSucc = false;
                        break;
                    }
                    var lxNext = this.ptr.get();
                    if (lxNext instanceof Lexer_1.OperatorLex) {
                        if (lxNext.argDelim) {
                            this.ptr.move(1);
                            continue;
                        }
                        else if (lxNext.arrBrClose) {
                            this.ptr.move(1);
                            break;
                        }
                    }
                }
                if (parseArrSucc) {
                    this.ptr.drop();
                    return new OperatorExp_1.VarArrIndexRef(vrefExp.id, indexExpression);
                }
            }
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