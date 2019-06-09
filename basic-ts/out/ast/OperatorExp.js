"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TreeIterator_1 = require("../TreeIterator");
var AExpression = /** @class */ (function () {
    function AExpression() {
    }
    /**
     * Обход всех дочерних узлов включая себя
     * @param f функция приемник
     */
    AExpression.prototype.each = function (f) {
        TreeIterator_1.TreeIt.each(this, function (n) { return n.children; }, function (n) {
            f(n);
        });
    };
    AExpression.prototype.minMaxLex = function () {
        var minl = null;
        var maxl = null;
    };
    return AExpression;
}());
exports.AExpression = AExpression;
/**
 * Константное значение (Литерал - строка/число/и т.д...)
 */
var ConstExpression = /** @class */ (function (_super) {
    __extends(ConstExpression, _super);
    function ConstExpression(lex, value) {
        var _this = _super.call(this) || this;
        _this.lex = lex;
        _this.value = value;
        _this.lexems = [lex];
        _this.children = [];
        return _this;
    }
    return ConstExpression;
}(AExpression));
exports.ConstExpression = ConstExpression;
/**
 * Ссылка на переменную
 */
var VarRefExpression = /** @class */ (function (_super) {
    __extends(VarRefExpression, _super);
    function VarRefExpression(lex) {
        var _this = _super.call(this) || this;
        _this.lex = lex;
        _this.lexems = [lex];
        _this.children = [];
        return _this;
    }
    return VarRefExpression;
}(AExpression));
exports.VarRefExpression = VarRefExpression;
/**
 * Бинарная операция
 */
var BinaryOpExpression = /** @class */ (function (_super) {
    __extends(BinaryOpExpression, _super);
    function BinaryOpExpression(op, left, right) {
        var _this = _super.call(this) || this;
        _this.operator = op;
        _this.left = left;
        _this.right = right;
        _this.lexems = [op];
        _this.children = [left, right];
        return _this;
    }
    return BinaryOpExpression;
}(AExpression));
exports.BinaryOpExpression = BinaryOpExpression;
/**
 * Унраная операция
 */
var UnaryOpExpression = /** @class */ (function (_super) {
    __extends(UnaryOpExpression, _super);
    function UnaryOpExpression(op, base) {
        var _this = _super.call(this) || this;
        _this.operator = op;
        _this.base = base;
        _this.lexems = [op];
        _this.children = [base];
        return _this;
    }
    return UnaryOpExpression;
}(AExpression));
exports.UnaryOpExpression = UnaryOpExpression;
//# sourceMappingURL=OperatorExp.js.map