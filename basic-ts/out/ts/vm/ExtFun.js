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
    function CallCtx(vm, call) {
        this.call = call;
        this.vm = vm;
    }
    Object.defineProperty(CallCtx.prototype, "source", {
        get: function () { return this.vm.source; },
        enumerable: true,
        configurable: true
    });
    return CallCtx;
}());
exports.CallCtx = CallCtx;
/**
 * Внешняя функция
 */
var Fun = /** @class */ (function () {
    function Fun() {
    }
    /**
     * Вызов внешней функции
     * @param ctx контекст вызова функции
     * @param args аргументы функции
     */
    Fun.prototype.apply = function (ctx, args) {
    };
    return Fun;
}());
exports.Fun = Fun;
/**
 * Вызов функции без аргументов
 */
var Fun0 = /** @class */ (function (_super) {
    __extends(Fun0, _super);
    function Fun0(fn0) {
        var _this = _super.call(this) || this;
        _this.fn0 = fn0;
        return _this;
    }
    Fun0.prototype.apply = function (ctx, args) {
        return this.fn0(ctx);
    };
    return Fun0;
}(Fun));
exports.Fun0 = Fun0;
/**
 * Вызов функции без аргументов
 */
var Fun1 = /** @class */ (function (_super) {
    __extends(Fun1, _super);
    function Fun1(fn1) {
        var _this = _super.call(this) || this;
        _this.fn1 = fn1;
        return _this;
    }
    Fun1.prototype.apply = function (ctx, args) {
        if (args && args.length > 0) {
            return this.fn1(ctx, args[0]);
        }
        else {
            throw new Error("can't call procedure " + name);
        }
    };
    return Fun1;
}(Fun));
exports.Fun1 = Fun1;
/**
 * Вызов функции без аргументов
 */
var Fun2 = /** @class */ (function (_super) {
    __extends(Fun2, _super);
    function Fun2(fn2) {
        var _this = _super.call(this) || this;
        _this.fn2 = fn2;
        return _this;
    }
    Fun2.prototype.apply = function (ctx, args) {
        if (args && args.length > 1) {
            return this.fn2(ctx, args[0], args[1]);
        }
        else {
            throw new Error("can't call procedure " + name);
        }
    };
    return Fun2;
}(Fun));
exports.Fun2 = Fun2;
/**
 * Вызов функции без аргументов
 */
var Fun3 = /** @class */ (function (_super) {
    __extends(Fun3, _super);
    function Fun3(fn3) {
        var _this = _super.call(this) || this;
        _this.fn3 = fn3;
        return _this;
    }
    Fun3.prototype.apply = function (ctx, args) {
        if (args && args.length > 2) {
            return this.fn3(ctx, args[0], args[1], args[2]);
        }
        else {
            throw new Error("can't call procedure " + name);
        }
    };
    return Fun3;
}(Fun));
exports.Fun3 = Fun3;
//# sourceMappingURL=ExtFun.js.map