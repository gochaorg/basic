"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConstExpression = /** @class */ (function () {
    function ConstExpression(lex, value) {
        this.lex = lex;
        this.value = value;
    }
    return ConstExpression;
}());
exports.ConstExpression = ConstExpression;
var VarRefExpression = /** @class */ (function () {
    function VarRefExpression(lex) {
        this.lex = lex;
    }
    return VarRefExpression;
}());
exports.VarRefExpression = VarRefExpression;
var BinaryOpExpression = /** @class */ (function () {
    function BinaryOpExpression(op, left, right) {
        this.operator = op;
        this.left = left;
        this.right = right;
    }
    return BinaryOpExpression;
}());
exports.BinaryOpExpression = BinaryOpExpression;
var UnaryOpExpression = /** @class */ (function () {
    function UnaryOpExpression(op, base) {
        this.operator = op;
        this.base = base;
    }
    return UnaryOpExpression;
}());
exports.UnaryOpExpression = UnaryOpExpression;
//# sourceMappingURL=OperatorExp.js.map