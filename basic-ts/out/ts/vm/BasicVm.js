"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LetStatement_1 = require("../ast/LetStatement");
var OperatorExp_1 = require("../ast/OperatorExp");
var Memo_1 = require("./Memo");
var Num_1 = require("../Num");
var RemStatement_1 = require("../ast/RemStatement");
var RunStatement_1 = require("../ast/RunStatement");
var GotoStatement_1 = require("../ast/GotoStatement");
var IfStatement_1 = require("../ast/IfStatement");
var BasicVm = /** @class */ (function () {
    function BasicVm(source, memo) {
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
    BasicVm.prototype.evalExpression = function (exp) {
        if (exp instanceof OperatorExp_1.LiteralExpression) {
            return exp.value;
        }
        if (exp instanceof OperatorExp_1.VarRefExpression) {
            var res = this.memo.read(exp.varname);
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
            throw new Error("undefined unary operator " + exp.operator.keyWord);
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
                var l = this.evalExpression(exp.left);
                var r = this.evalExpression(exp.right);
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
            throw new Error("undefined binary operator " + exp.operator.keyWord);
        }
        throw new Error("undefined expression " + exp);
    };
    /**
     * Выполняет выражение (statement)
     * @param st выражение
     */
    BasicVm.prototype.evalStatement = function (st) {
        if (st instanceof RemStatement_1.RemStatement) {
            return;
        }
        if (st instanceof LetStatement_1.LetStatement) {
            var val = this.evalExpression(st.value);
            this.memo.write(st.varname, val);
            return;
        }
        if (st instanceof RunStatement_1.RunStatement) {
            return;
        }
        if (st instanceof GotoStatement_1.GotoStatement) {
            var found = this.source.find(st.gotoLine.value);
            if (found) {
                this.ip = found.index;
            }
            else {
                throw new Error("source line " + st.gotoLine.value + " not found");
            }
            return;
        }
        if (st instanceof IfStatement_1.IfStatement) {
            var bval = this.evalExpression(st.boolExp);
            if (bval) {
                this.evalStatement(st.trueStatement);
            }
            else if (st.falseStatement) {
                this.evalStatement(st.falseStatement);
            }
        }
    };
    /**
     * Проверяет есть ли еще инструкции для выполнения
     * @returns true - есть инструкции для выполенения
     */
    BasicVm.prototype.hasNext = function () {
        if (this.ip < 0)
            return false;
        if (this.ip >= this.source.lines.length)
            return false;
        return true;
    };
    /**
     * Выполняет очередную инструкцию
     * @returns true - инструкция выполнена / false - инструкция не была выполнена ибо конец
     */
    BasicVm.prototype.next = function () {
        if (!this.hasNext())
            return false;
        var st = this.source.lines[this.ip];
        if (st == undefined || st == null)
            return false;
        var beforeIp = this.ip;
        this.evalStatement(st.statement);
        var afterIp = this.ip;
        if (afterIp == beforeIp) {
            this.ip++;
        }
        return false;
    };
    return BasicVm;
}());
exports.BasicVm = BasicVm;
//# sourceMappingURL=BasicVm.js.map