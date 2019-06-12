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
var TreeIt_1 = require("../TreeIt");
var AExpression = /** @class */ (function () {
    function AExpression() {
    }
    Object.defineProperty(AExpression.prototype, "treeList", {
        get: function () {
            return TreeIt_1.TreeIt.list(this, function (n) { return n.children; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AExpression.prototype, "treeLexList", {
        get: function () {
            var arr = [];
            this.treeList.forEach(function (exp) {
                exp.value.lexems.forEach(function (lx) { return arr.push(lx); });
            });
            return arr;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AExpression.prototype, "leftTreeLex", {
        get: function () {
            var lxs = this.treeLexList;
            if (lxs.length < 1)
                return undefined;
            if (lxs.length == 1)
                return lxs[0];
            return lxs.reduce(function (a, b) { return a.begin > b.begin ? b : a; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AExpression.prototype, "rightTreeLex", {
        get: function () {
            var lxs = this.treeLexList;
            if (lxs.length < 1)
                return undefined;
            if (lxs.length == 1)
                return lxs[0];
            return lxs.reduce(function (a, b) { return a.begin > b.begin ? a : b; });
        },
        enumerable: true,
        configurable: true
    });
    return AExpression;
}());
exports.AExpression = AExpression;
/**
 * Константное значение (Литерал - строка/число/и т.д...)
 */
var LiteralExpression = /** @class */ (function (_super) {
    __extends(LiteralExpression, _super);
    function LiteralExpression(lex, value) {
        var _this = _super.call(this) || this;
        _this.lex = lex;
        _this.value = value;
        _this.lexems = [lex];
        _this.children = [];
        _this.kind = 'Literal';
        return _this;
    }
    return LiteralExpression;
}(AExpression));
exports.LiteralExpression = LiteralExpression;
/**
 * Ссылка на переменную
 */
var VarRefExpression = /** @class */ (function (_super) {
    __extends(VarRefExpression, _super);
    function VarRefExpression(lex) {
        var _this = _super.call(this) || this;
        _this.id = lex;
        _this.lexems = [lex];
        _this.children = [];
        _this.kind = 'VarRef';
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
        _this.kind = 'BinaryOperator';
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
        _this.kind = 'UnaryOperator';
        return _this;
    }
    return UnaryOpExpression;
}(AExpression));
exports.UnaryOpExpression = UnaryOpExpression;
//# sourceMappingURL=OperatorExp.js.map