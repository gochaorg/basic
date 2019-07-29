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
/**
 * Контекст вызова внешней функции
 */
var CallCtx = /** @class */ (function () {
    function CallCtx() {
    }
    return CallCtx;
}());
exports.CallCtx = CallCtx;
/**
 * Внешняя функция
 */
var ExtFun = /** @class */ (function () {
    function ExtFun() {
    }
    /**
     * Вызов внешней функции
     * @param ctx контекст вызова функции
     * @param args аргументы функции
     */
    ExtFun.prototype.apply = function (ctx, args) {
    };
    return ExtFun;
}());
exports.ExtFun = ExtFun;
/**
 * Вызов функции без аргументов
 */
var ExtFun0 = /** @class */ (function (_super) {
    __extends(ExtFun0, _super);
    function ExtFun0(fn0) {
        var _this = _super.call(this) || this;
        _this.fn0 = fn0;
        return _this;
    }
    ExtFun0.prototype.apply = function (ctx, args) {
        this.fn0(ctx);
    };
    return ExtFun0;
}(ExtFun));
exports.ExtFun0 = ExtFun0;
/**
 * Вызов функции без аргументов
 */
var ExtFun1 = /** @class */ (function (_super) {
    __extends(ExtFun1, _super);
    function ExtFun1(fn1) {
        var _this = _super.call(this) || this;
        _this.fn1 = fn1;
        return _this;
    }
    ExtFun1.prototype.apply = function (ctx, args) {
        if (args && args.length > 0) {
            this.fn1(ctx, args[0]);
        }
        else {
            throw new Error("can't call procedure " + name);
        }
    };
    return ExtFun1;
}(ExtFun));
exports.ExtFun1 = ExtFun1;
//# sourceMappingURL=ExtFun.js.map