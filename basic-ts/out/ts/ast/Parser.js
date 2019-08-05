"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pointer_1 = require("./Pointer");
const Lexer_1 = require("./Lexer");
const RemStatement_1 = require("./RemStatement");
const Statements_1 = require("./Statements");
const OperatorExp_1 = require("./OperatorExp");
const LetStatement_1 = require("./LetStatement");
const RunStatement_1 = require("./RunStatement");
const GotoStatement_1 = require("./GotoStatement");
const IfStatement_1 = require("./IfStatement");
const GoSubStatement_1 = require("./GoSubStatement");
const ReturnStatement_1 = require("./ReturnStatement");
const PrintStatement_1 = require("./PrintStatement");
const CallStatement_1 = require("./CallStatement");
/**
 * Опции парсера
 */
class Options {
    constructor() {
        /**
         * парсинг statement с учетом номера строки
         */
        this.tryLineNum = true;
    }
    /**
     * Клонирование
     */
    clone(conf) {
        const c = new Options();
        c.tryLineNum = this.tryLineNum;
        if (conf) {
            conf(c);
        }
        return c;
    }
}
exports.Options = Options;
/**
 * Парсинг BASIC
 */
class Parser {
    /**
     * Конструктор
     * @param lexs лексемы
     */
    constructor(lexs) {
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
    static create(source) {
        return new Parser(Lexer_1.parseBasicLexs(source));
    }
    log(...args) {
        if (this.debug) {
            console.log(...args);
        }
    }
    /**
     * statements ::= { statement }
     */
    statements() {
        const res = [];
        if (this.ptr.eof)
            return null;
        const total = this.ptr.entries.length;
        const tailEntries = this.ptr.gets(total - this.ptr.ptr);
        const lines = Lexer_1.filter(tailEntries).lines;
        let firstLex = null;
        let lastLex = null;
        this.log("statements() lines:", lines);
        for (let li = 0; li < lines.length; li++) {
            const lineLex = lines[li];
            if (firstLex == null && lineLex.length > 0) {
                firstLex = lineLex[0];
            }
            if (lineLex.length > 0) {
                lastLex = lineLex[lineLex.length - 1];
            }
            this.log("statements() line:", lineLex);
            const lineParser = new Parser(lineLex);
            lineParser.debug = this.debug;
            while (!lineParser.ptr.eof) {
                const lineStatement = lineParser.statement();
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
    }
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
    statement(opts) {
        if (!opts) {
            opts = this.options;
        }
        this.log('statement() ptr=', this.ptr.gets(3));
        const remStmt = this.remStatement(opts);
        if (remStmt)
            return remStmt;
        const letStmt = this.letStatement(opts);
        if (letStmt)
            return letStmt;
        const runStmt = this.runStatement(opts);
        if (runStmt)
            return runStmt;
        const gotoStmt = this.gotoStatement(opts);
        if (gotoStmt)
            return gotoStmt;
        const ifStmt = this.ifStatement(opts);
        if (ifStmt)
            return ifStmt;
        const gosubStmt = this.gosubStatement(opts);
        if (gosubStmt)
            return gosubStmt;
        const returnStmt = this.returnStatement(opts);
        if (returnStmt)
            return returnStmt;
        const printStmt = this.printStatement(opts);
        if (printStmt)
            return printStmt;
        const callStmt = this.callStatement(opts);
        if (callStmt)
            return callStmt;
        return null;
    }
    /**
     * Проверка если текущая лексема обозначает начало нумерованной строки,
     * то лексема и номер строки передается в функцию,
     * а указатель смещается к след лексеме.
     *
     * Функция модет вернуть null, тогда будет восстановлена позиция
     * @param proc функция принимающая номер строки
     */
    matchLine(proc) {
        let lineNum = undefined;
        let lineNumLex = this.ptr.get(0);
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
                let res = proc({ line: lineNum, lex: lineNumLex });
                if (res) {
                    this.ptr.drop();
                    return res;
                }
                this.ptr.pop();
            }
        }
        return null;
    }
    /**
     * remStatement ::= SourceLineBeginLex RemLex
     *                | NumberLex RemLex
     *                | RemLex
     */
    remStatement(opts) {
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        let [lex1, lex2] = this.ptr.gets(2);
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
    }
    /**
     * letStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                  StatementLex(LET) IDLex OperatorLex(=) expression
     */
    letStatement(opts) {
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
        const prod = (arg) => {
            this.ptr.push();
            let lexLet = this.ptr.get();
            if (lexLet instanceof Lexer_1.StatementLex && lexLet.LET) {
                this.ptr.move(1);
            }
            else {
                this.ptr.pop();
                return null;
            }
            const lexId = this.ptr.get();
            if (lexId instanceof Lexer_1.IDLex) {
                const lxNext = this.ptr.get(1);
                if (lxNext instanceof Lexer_1.OperatorLex && lxNext.keyWord == '=') {
                    this.ptr.move(2);
                    const exp = this.expression();
                    if (exp) {
                        const begin = arg ? arg.lex : lexLet;
                        let end = exp.rightTreeLex || begin;
                        this.ptr.drop();
                        return new LetStatement_1.LetStatement(begin, end, lexId, exp);
                    }
                }
                // if( lxNext instanceof OperatorLex && lxNext.arrBrOpen ){
                //     this.ptr.move(2)
                //     //let exp
                // }
            }
            this.ptr.pop();
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
    }
    /**
     * runStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                  StatementLex(RUN) [lineNumber : NumberLex]
     */
    runStatement(opts) {
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        this.log('runStatement() ptr=', this.ptr.gets(3));
        let lineNum = undefined;
        let lineNumLex = this.ptr.get(0);
        let off = 0;
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
        let runLex = this.ptr.get(off);
        if (runLex instanceof Lexer_1.StatementLex &&
            runLex.RUN) {
            this.log('runStatement() RUN');
            let runLineLex = this.ptr.get(off + 1);
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
    }
    /**
     * gotoStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                   StatementLex(GOTO) lineNumber:NumberLex
     * @param opts опции компилятора
     */
    gotoStatement(opts) {
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        this.log('gotoStatement() ptr=', this.ptr.gets(3));
        const prod = (linf) => {
            let [gtLex, gtLine] = this.ptr.gets(2);
            if (gtLex instanceof Lexer_1.StatementLex
                && gtLex.GOTO
                && gtLine instanceof Lexer_1.NumberLex) {
                this.ptr.move(2);
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
    }
    /**
     * gosubStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                   StatementLex(GOSUB) lineNumber:NumberLex
     * @param opts опции компилятора
     */
    gosubStatement(opts) {
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        this.log('gosubStatement() ptr=', this.ptr.gets(3));
        const prod = (linf) => {
            let [gtLex, gtLine] = this.ptr.gets(2);
            if (gtLex instanceof Lexer_1.StatementLex
                && gtLex.GOSUB
                && gtLine instanceof Lexer_1.NumberLex) {
                this.ptr.move(2);
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
    }
    /**
     * returnStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                   StatementLex(RETURN) [lineNumber:NumberLex]
     * @param opts опции компилятора
     */
    returnStatement(opts) {
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        this.log('returnStatement() ptr=', this.ptr.gets(3));
        const prod = (linf) => {
            let [gtLex] = this.ptr.gets(1);
            if (gtLex instanceof Lexer_1.StatementLex
                && gtLex.RETURN) {
                this.ptr.move(1);
                let [gtLine] = this.ptr.fetch(0, 1);
                if (gtLine instanceof Lexer_1.NumberLex) {
                    this.ptr.move(1);
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
    }
    /**
     * ifStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                 StatementLex(IF) expression
     *                 StatementLex(THEN) statement
     *                 [StatementLex(ELSE) statement]
     * @param opts опции компилятора
     */
    ifStatement(opts) {
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        this.log('ifStatement() ptr=', this.ptr.gets(3));
        const prod = (linf) => {
            let ifLx = this.ptr.get();
            this.log("ifLx ", ifLx);
            if (!ifLx)
                return null;
            if (!(ifLx instanceof Lexer_1.StatementLex))
                return null;
            if (!(ifLx.IF))
                return null;
            this.ptr.push();
            this.ptr.move(1);
            let exp = this.expression();
            if (!exp) {
                this.ptr.pop();
                return null;
            }
            let thenLx = this.ptr.get();
            if (thenLx instanceof Lexer_1.StatementLex && !thenLx.THEN) {
                this.ptr.pop();
                return null;
            }
            this.ptr.move(1);
            const conf = (op) => { op.tryLineNum = false; };
            let trueSt = this.statement(opts ? opts.clone(conf) : this.options.clone(conf));
            if (trueSt == null) {
                this.ptr.pop();
                return null;
            }
            let elseLx = this.ptr.get();
            let falseSt = null;
            if (elseLx instanceof Lexer_1.StatementLex && elseLx.ELSE) {
                this.ptr.push();
                this.ptr.move(1);
                falseSt = this.statement(opts ? opts.clone(conf) : this.options.clone(conf));
                if (falseSt) {
                    this.ptr.drop();
                }
                else {
                    this.ptr.pop();
                }
            }
            this.ptr.drop();
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
    }
    /**
     * printStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                    StatementLex(PRINT) [expression {',' expression}]
     * @param opts опции компилятора
     */
    printStatement(opts) {
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        this.log('printStatement() ptr=', this.ptr.gets(3));
        const prod = (linf) => {
            let [gtLex] = this.ptr.gets(1);
            if (gtLex instanceof Lexer_1.StatementLex
                && gtLex.PRINT) {
                this.ptr.move(1);
                const exps = [];
                let lastLex = gtLex;
                while (true) {
                    if (exps.length > 0) {
                        const lNext = this.ptr.get();
                        if (!(lNext && lNext instanceof Lexer_1.OperatorLex && lNext.argDelim)) {
                            break;
                        }
                        else {
                            this.ptr.move(1);
                        }
                    }
                    this.ptr.push();
                    const exp = this.expression();
                    if (exp) {
                        exps.push(exp);
                        if (exp.rightTreeLex) {
                            lastLex = exp.rightTreeLex;
                        }
                    }
                    else {
                        this.ptr.pop();
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
    }
    /**
     * callStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                    StatementLex(CALL) IDLex [expression {',' expression}]
     * @param opts опции компилятора
     */
    callStatement(opts) {
        if (!opts) {
            opts = this.options;
        }
        if (this.ptr.eof)
            return null;
        this.log('callStatement() ptr=', this.ptr.gets(3));
        const prod = (linf) => {
            let [callLex, idLex] = this.ptr.gets(2);
            if (callLex instanceof Lexer_1.StatementLex
                && callLex.CALL
                && idLex instanceof Lexer_1.IDLex) {
                this.ptr.move(2);
                const exps = [];
                let lastLex = callLex;
                while (true) {
                    if (exps.length > 0) {
                        const lNext = this.ptr.get();
                        if (!(lNext && lNext instanceof Lexer_1.OperatorLex && lNext.argDelim)) {
                            break;
                        }
                        else {
                            this.ptr.move(1);
                        }
                    }
                    this.ptr.push();
                    const exp = this.expression();
                    if (exp) {
                        exps.push(exp);
                        if (exp.rightTreeLex) {
                            lastLex = exp.rightTreeLex;
                        }
                    }
                    else {
                        this.ptr.pop();
                        if (exps.length > 0) {
                            //TODO here error report
                        }
                        break;
                    }
                }
                return new CallStatement_1.CallStatement(linf ? linf.lex : callLex, lastLex, callLex, idLex, exps);
            }
            return null;
        };
        if (opts.tryLineNum) {
            return this.matchLine(prod) || prod();
        }
        else {
            return prod();
        }
    }
    /**
     * expression ::= impExpression | bracketExpression
     */
    expression() {
        this.log('expression() ptr=', this.ptr.gets(3));
        let powExp = this.impExpression();
        if (powExp)
            return powExp;
        let brExp = this.bracketExpression();
        if (brExp)
            return brExp;
        return null;
    }
    /**
     * bracketExpression ::= '(' expression ')'
     */
    bracketExpression() {
        if (this.ptr.eof)
            return null;
        let leftBr = this.ptr.get(0);
        if (leftBr instanceof Lexer_1.KeyWordLex && leftBr.keyWord == '(') {
            this.ptr.push();
            this.ptr.move(1);
            let exp = this.expression();
            if (exp) {
                let rightBr = this.ptr.get(0);
                if (rightBr instanceof Lexer_1.KeyWordLex && rightBr.keyWord == ')') {
                    this.ptr.move(1);
                    this.ptr.drop();
                    return exp;
                }
            }
            this.ptr.pop();
        }
        return null;
    }
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
    binaryRepeatExpression(ruleName, leftOp, rightExp, accpetOperator) {
        let res = leftOp;
        while (true) {
            let lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && accpetOperator(lx)) {
                this.ptr.move(1);
                let rightOp = rightExp();
                this.log(`${ruleName} right=`, rightOp);
                if (rightOp) {
                    this.ptr.drop();
                    this.log(`${ruleName} succ=`, lx.keyWord, res, rightOp);
                    res = new OperatorExp_1.BinaryOpExpression(lx, res, rightOp);
                    lx = this.ptr.get();
                    if (lx instanceof Lexer_1.OperatorLex && accpetOperator(lx)) {
                        this.log(`${ruleName} has right ${lx.keyWord}`);
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
    }
    /**
     * impExpression ::= eqvExpression [ { 'IMP' eqvExpression } ]
     */
    impExpression() {
        this.log('impExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        let leftOp = this.eqvExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('impExpression()', leftOp, () => this.eqvExpression(), (lx) => lx.imp);
        }
        this.ptr.pop();
        return null;
    }
    /**
     * eqvExpression ::= xorExpression [ 'EQV' xorExpression ]
     */
    eqvExpression() {
        this.log('eqvExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        let leftOp = this.xorExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('eqvExpression()', leftOp, () => this.xorExpression(), (lx) => lx.eqv);
        }
        this.ptr.pop();
        return null;
    }
    /**
     * xorExpression ::= orExpression [ { 'XOR' orExpression } ]
     */
    xorExpression() {
        this.log('xorExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        let leftOp = this.orExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('xorExpression()', leftOp, () => this.orExpression(), (lx) => lx.xor);
        }
        this.ptr.pop();
        return null;
    }
    /**
     * orExpression ::= andExpression [ { 'OR' andExpression } ]
     */
    orExpression() {
        this.log('orExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        let leftOp = this.andExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('orExpression()', leftOp, () => this.andExpression(), (lx) => lx.or);
        }
        this.ptr.pop();
        return null;
    }
    /**
     * andExpression ::= notExpression [ { 'AND' notExpression } ]
     */
    andExpression() {
        this.log('andExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        let leftOp = this.notExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('andExpression()', leftOp, () => this.notExpression(), (lx) => lx.and);
        }
        this.ptr.pop();
        return null;
    }
    /**
     * notExpression ::= ['NOT'] relationExpression
     */
    notExpression() {
        this.log('notExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        let lx = this.ptr.get();
        if (lx instanceof Lexer_1.OperatorLex && lx.not) {
            this.ptr.push();
            this.ptr.move(1);
            let exp = this.relationExpression();
            if (exp) {
                this.ptr.drop();
                return new OperatorExp_1.UnaryOpExpression(lx, exp);
            }
            this.ptr.pop();
            return null;
        }
        return this.relationExpression();
    }
    /**
     * relationExpression ::= plusExpression [ ('=', '<>', '><', '<', '>', '>=', '<=', '=>', '=<') plusExpression ]
     */
    relationExpression() {
        this.log('relationExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        let leftOp = this.plusExpression();
        if (leftOp) {
            let lx = this.ptr.get();
            if (lx instanceof Lexer_1.OperatorLex && lx.ordReleation) {
                this.ptr.move(1);
                let rightOp = this.plusExpression();
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
    }
    /**
     * plusExpression ::= modExpression [ { ('+' | '-') modExpression } ]
     */
    plusExpression() {
        this.log('plusExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        let leftOp = this.modExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('plusExpression()', leftOp, () => this.modExpression(), (lx) => lx.plus || lx.minus);
        }
        this.ptr.pop();
        return null;
    }
    /**
     * modExpression ::= intDivExpression [ { 'MOD' intDivExpression } ]
     */
    modExpression() {
        this.log('modExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        let leftOp = this.intDivExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('modExpression()', leftOp, () => this.intDivExpression(), (lx) => lx.mod);
        }
        this.ptr.pop();
        return null;
    }
    /**
     * intDivExpression ::= mulExpression [ { '\' mulExpression } ]
     */
    intDivExpression() {
        this.log('intDivExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        let leftOp = this.mulExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('intDivExpression()', leftOp, () => this.mulExpression(), (lx) => lx.idiv);
        }
        this.ptr.pop();
        return null;
    }
    /**
     * mulExpression ::= powExpression [ { ( '*' | '/' ) powExpression } ]
     */
    mulExpression() {
        this.log('mulExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        let leftOp = this.powExpression();
        if (leftOp) {
            return this.binaryRepeatExpression('mulExpression()', leftOp, () => this.powExpression(), (lx) => lx.mult || lx.div);
        }
        this.ptr.pop();
        return null;
    }
    /**
     * powExpression ::= signedAtom [ { '^' signedAtom } ]
     */
    powExpression() {
        this.log('powExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        let leftOp = this.signedAtom();
        if (leftOp) {
            return this.binaryRepeatExpression('powExpression()', leftOp, () => this.signedAtom(), (lx) => lx.pow);
        }
        this.ptr.pop();
        return null;
    }
    /**
     * signedAtom ::= [ '+' | '-' ] atom
     */
    signedAtom() {
        this.log('signedAtom() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        this.ptr.push();
        let unary = false;
        let unaryLx = this.ptr.get();
        if (unaryLx instanceof Lexer_1.OperatorLex && (unaryLx.keyWord == '-' || unaryLx.keyWord == '+')) {
            this.ptr.move(1);
            unary = true;
        }
        let atom = this.atom();
        if (atom) {
            this.ptr.drop();
            if (unary) {
                return new OperatorExp_1.UnaryOpExpression(unaryLx, atom);
            }
            return atom;
        }
        this.ptr.pop();
        return null;
    }
    /**
     * atom ::= '(' expression ')'
     *        | baseValueExpression
     */
    atom() {
        this.log('atom() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        let leftBr = this.ptr.get(0);
        if (leftBr instanceof Lexer_1.KeyWordLex && leftBr.keyWord == '(') {
            this.ptr.push();
            this.ptr.move(1);
            let exp = this.expression();
            if (exp) {
                let rightBr = this.ptr.get(0);
                if (rightBr instanceof Lexer_1.KeyWordLex && rightBr.keyWord == ')') {
                    this.ptr.move(1);
                    this.ptr.drop();
                    return exp;
                }
            }
            this.ptr.pop();
        }
        return this.baseValueExpression();
    }
    /**
     * baseValueExpression ::= constExpression
     *                       | varRefExpression '(' expression [{ ',' expression }] ')'
     *                       | varRefExpression
     */
    baseValueExpression() {
        this.log('baseValueExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        let cexpr = this.constExpression();
        this.log('baseValueExpression() cexpr=', cexpr);
        if (cexpr) {
            this.log('baseValueExpression() res=', cexpr);
            return cexpr;
        }
        let vrefExp = this.varRefExpression();
        this.log('baseValueExpression() vrefExp=', vrefExp);
        if (vrefExp) {
            this.log('baseValueExpression() res=', vrefExp);
            const brOpen = this.ptr.get();
            if (brOpen instanceof Lexer_1.OperatorLex && brOpen.arrBrOpen) {
                let parseArrSucc = true;
                const indexExpression = [];
                this.ptr.push();
                this.ptr.move(1);
                while (true) {
                    const idxExp = this.expression();
                    if (idxExp) {
                        indexExpression.push(idxExp);
                    }
                    else {
                        this.ptr.pop();
                        parseArrSucc = false;
                        break;
                    }
                    const lxNext = this.ptr.get();
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
    }
    /**
     * constExpression ::= NumberLex | StringLex
     */
    constExpression() {
        this.log('constExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        let lx = this.ptr.get();
        if (lx instanceof Lexer_1.NumberLex) {
            this.ptr.move(1);
            return new OperatorExp_1.LiteralExpression(lx, lx.value);
        }
        if (lx instanceof Lexer_1.StringLex) {
            this.ptr.move(1);
            return new OperatorExp_1.LiteralExpression(lx, lx.value);
        }
        return null;
    }
    /**
     * varRefExpression ::= IDLex
     */
    varRefExpression() {
        this.log('varRefExpression() ptr=', this.ptr.gets(3));
        if (this.ptr.eof)
            return null;
        let lx = this.ptr.get();
        this.log('varRefExpression() lx=', lx);
        if (lx instanceof Lexer_1.IDLex) {
            this.log('varRefExpression() succ', lx);
            this.ptr.move(1);
            return new OperatorExp_1.VarRefExpression(lx);
        }
        return null;
    }
}
exports.Parser = Parser;
//# sourceMappingURL=Parser.js.map