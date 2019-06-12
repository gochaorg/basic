"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OperatorExp_1 = require("../ast/OperatorExp");
var Memo_1 = require("./Memo");
var BasicVm = /** @class */ (function () {
    function BasicVm(source, memo) {
        this.source = source;
        if (memo) {
            this.memo = memo;
        }
        else {
            this.memo = new Memo_1.Memo();
        }
    }
    BasicVm.prototype.evaluate = function (exp) {
        if (exp instanceof OperatorExp_1.LiteralExpression) {
            return exp.value;
        }
        if (exp instanceof OperatorExp_1.VarRefExpression) {
            return this.memo.read(exp.id.id);
        }
        if (exp instanceof OperatorExp_1.UnaryOpExpression) {
            switch (exp.operator.keyWord.toLowerCase()) {
                case '-': return (0 - this.evaluate(exp.base));
                case '+': return this.evaluate(exp.base);
                case 'not': return !this.evaluate(exp.base);
                default:
                    throw new Error("undefined unary operator " + exp.operator.keyWord);
            }
        }
        if (exp instanceof OperatorExp_1.BinaryOpExpression) {
            switch (exp.operator.keyWord.toLowerCase()) {
                case '+': return (this.evaluate(exp.left) + this.evaluate(exp.right));
                case '-': return (this.evaluate(exp.left) - this.evaluate(exp.right));
                case '*': return (this.evaluate(exp.left) * this.evaluate(exp.right));
                case '/': return (this.evaluate(exp.left) / this.evaluate(exp.right));
                default:
                    throw new Error("undefined binary operator " + exp.operator.keyWord);
            }
        }
        return undefined;
    };
    return BasicVm;
}());
exports.BasicVm = BasicVm;
//# sourceMappingURL=Vm.js.map