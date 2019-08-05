"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LetStatement_1 = require("../ast/LetStatement");
const OperatorExp_1 = require("../ast/OperatorExp");
const Memo_1 = require("./Memo");
const Num_1 = require("../common/Num");
const RemStatement_1 = require("../ast/RemStatement");
const RunStatement_1 = require("../ast/RunStatement");
const GotoStatement_1 = require("../ast/GotoStatement");
const IfStatement_1 = require("../ast/IfStatement");
const GoSubStatement_1 = require("../ast/GoSubStatement");
const ReturnStatement_1 = require("../ast/ReturnStatement");
const PrintStatement_1 = require("../ast/PrintStatement");
const Printer_1 = require("./Printer");
const CallStatement_1 = require("../ast/CallStatement");
const ExtFun_1 = require("./ExtFun");
class BasicVm {
    constructor(source, memo) {
        this._printer = this.defaultPrinter;
        /**
         * Стек вызовов GoSub
         */
        this.ipStack = [];
        /**
         * Регистр IP (Instruction Pointer)
         */
        this.ip = -1;
        this.source = source;
        if (memo) {
            this.memo = memo;
        }
        else {
            this.memo = new Memo_1.Memo();
        }
    }
    /**
     * Вычисляет выражение (expression)
     * @param exp выражение
     */
    evalExpression(exp) {
        if (exp instanceof OperatorExp_1.LiteralExpression) {
            return exp.value;
        }
        if (exp instanceof OperatorExp_1.VarArrIndexRef) {
            const varInst = this.memo.read(exp.varname);
            if (varInst == undefined) {
                throw new Error("undefined variable " + exp.varname);
            }
            if (varInst instanceof ExtFun_1.Fun) {
                const ctx = new ExtFun_1.CallCtx(this, exp);
                const fn = varInst;
                const args = exp.indexes.map(e => this.evalExpression(e));
                return fn.apply(ctx, args);
            }
            const res = this.memo.read(exp.varname, exp.indexes);
            return res;
        }
        if (exp instanceof OperatorExp_1.VarRefExpression) {
            const res = this.memo.read(exp.varname);
            if (res == undefined)
                throw new Error("undefined variable " + exp.varname);
            return res;
        }
        if (exp instanceof OperatorExp_1.UnaryOpExpression) {
            if (exp.operator.minus)
                return (0 - this.evalExpression(exp.base));
            if (exp.operator.plus)
                return this.evalExpression(exp.base);
            if (exp.operator.not)
                return !this.evalExpression(exp.base);
            throw new Error(`undefined unary operator ${exp.operator.keyWord}`);
        }
        if (exp instanceof OperatorExp_1.BinaryOpExpression) {
            //#region math
            if (exp.operator.plus)
                return (this.evalExpression(exp.left) + this.evalExpression(exp.right));
            if (exp.operator.minus)
                return (this.evalExpression(exp.left) - this.evalExpression(exp.right));
            if (exp.operator.mult)
                return (this.evalExpression(exp.left) * this.evalExpression(exp.right));
            if (exp.operator.div)
                return (this.evalExpression(exp.left) / this.evalExpression(exp.right));
            if (exp.operator.idiv)
                return Num_1.asInt(this.evalExpression(exp.left) / Num_1.asInt(this.evalExpression(exp.right)));
            if (exp.operator.mod)
                return Num_1.asInt(this.evalExpression(exp.left) % this.evalExpression(exp.right));
            //#endregion
            //#region logic
            if (exp.operator.and)
                return this.evalExpression(exp.left) && this.evalExpression(exp.right);
            if (exp.operator.or)
                return this.evalExpression(exp.left) || this.evalExpression(exp.right);
            // TODO check type
            if (exp.operator.xor)
                return !(this.evalExpression(exp.left) == this.evalExpression(exp.right));
            // TODO check type
            if (exp.operator.eqv)
                return this.evalExpression(exp.left) == this.evalExpression(exp.right);
            if (exp.operator.imp) {
                const l = this.evalExpression(exp.left);
                const r = this.evalExpression(exp.right);
                if (l) {
                    if (r) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return true;
                }
            }
            //#endregion
            //#region compare
            if (exp.operator.equals) {
                return this.evalExpression(exp.left) == this.evalExpression(exp.right);
            }
            if (exp.operator.notEquals) {
                return this.evalExpression(exp.left) != this.evalExpression(exp.right);
            }
            if (exp.operator.less) {
                return this.evalExpression(exp.left) < this.evalExpression(exp.right);
            }
            if (exp.operator.lesOrEquals) {
                return this.evalExpression(exp.left) <= this.evalExpression(exp.right);
            }
            if (exp.operator.more) {
                return this.evalExpression(exp.left) > this.evalExpression(exp.right);
            }
            if (exp.operator.moreOrEquals) {
                return this.evalExpression(exp.left) >= this.evalExpression(exp.right);
            }
            //#endregion
            throw new Error(`undefined binary operator ${exp.operator.keyWord}`);
        }
        throw new Error("undefined expression " + exp);
    }
    //#region Printing
    get defaultPrinter() {
        return Printer_1.printers.console.clone().configure(c => {
            c.prefix = "BASIC> ";
        });
    }
    get printer() { return this._printer; }
    set printer(x) {
        if (x) {
            this._printer = x;
        }
        else {
            this._printer = this.defaultPrinter;
        }
    }
    print(v) {
        this.printer.print(v);
    }
    println() {
        this.printer.println();
    }
    //#endregion
    callProcudure(name, args, callst) {
        const fnInst = this.memo.read(name);
        if (typeof (fnInst) == 'object' && fnInst instanceof ExtFun_1.Fun) {
            const fn = fnInst;
            const ctx = new ExtFun_1.CallCtx(this, callst);
            fn.apply(ctx, args);
        }
        else if (typeof (fnInst) == 'function') {
            const fn = fnInst;
            fn.apply({}, args);
        }
        else {
            throw new Error(`can't call procedure ${name}, procedure not found`);
        }
    }
    /**
     * Выполняет выражение (statement)
     * @param st выражение
     */
    evalStatement(st) {
        if (st instanceof RemStatement_1.RemStatement) {
            return;
        }
        if (st instanceof LetStatement_1.LetStatement) {
            const val = this.evalExpression(st.value);
            this.memo.write(st.varname, val);
            return;
        }
        if (st instanceof RunStatement_1.RunStatement) {
            return;
        }
        if (st instanceof GotoStatement_1.GotoStatement) {
            const found = this.source.find(st.gotoLine.value);
            if (found) {
                this.ip = found.index;
            }
            else {
                throw new Error(`source line ${st.gotoLine.value} not found`);
            }
            return;
        }
        if (st instanceof GoSubStatement_1.GoSubStatement) {
            const found = this.source.find(st.gotoLine.value);
            if (found) {
                //console.log("gosub ",found)
                this.ipStack.push(this.ip);
                this.ip = found.index;
            }
            else {
                throw new Error(`source line ${st.gotoLine.value} not found`);
            }
        }
        if (st instanceof ReturnStatement_1.ReturnStatement) {
            if (st.gotoLine) {
                const found = this.source.find(st.gotoLine.value);
                if (found) {
                    this.ipStack.pop();
                    this.ip = found.index;
                }
                else {
                    throw new Error(`source line ${st.gotoLine.value} not found`);
                }
            }
            else {
                if (this.ipStack.length > 0) {
                    const targetIp = this.ipStack.pop();
                    if (targetIp !== undefined) {
                        this.ip = targetIp + 1;
                    }
                    else {
                        throw new Error(`gosub stack return undefined`);
                    }
                }
                else {
                    throw new Error(`gosub stack is empty`);
                }
            }
        }
        if (st instanceof IfStatement_1.IfStatement) {
            const bval = this.evalExpression(st.boolExp);
            if (bval) {
                this.evalStatement(st.trueStatement);
            }
            else if (st.falseStatement) {
                this.evalStatement(st.falseStatement);
            }
        }
        if (st instanceof PrintStatement_1.PrintStatement) {
            st.args.forEach((exp) => {
                const v = this.evalExpression(exp);
                this.print(v);
            });
            this.println();
        }
        if (st instanceof CallStatement_1.CallStatement) {
            const callArgs = [];
            st.args.forEach((exp) => {
                const v = this.evalExpression(exp);
                callArgs.push(v);
            });
            this.callProcudure(st.name.id, callArgs, st);
        }
    }
    /**
     * Проверяет есть ли еще инструкции для выполнения
     * @returns true - есть инструкции для выполенения
     */
    hasNext() {
        if (this.ip < 0)
            return false;
        if (this.ip >= this.source.lines.length)
            return false;
        return true;
    }
    /**
     * Выполняет очередную инструкцию
     * @returns true - инструкция выполнена / false - инструкция не была выполнена ибо конец
     */
    next() {
        if (!this.hasNext())
            return false;
        const st = this.source.lines[this.ip];
        if (st == undefined || st == null)
            return false;
        const beforeIp = this.ip;
        this.evalStatement(st.statement);
        const afterIp = this.ip;
        if (afterIp == beforeIp) {
            this.ip++;
        }
        return true;
    }
}
exports.BasicVm = BasicVm;
//# sourceMappingURL=BasicVm.js.map