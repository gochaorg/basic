"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Контекст вызова внешней функции
 */
class CallCtx {
    constructor(vm, call) {
        this.call = call;
        this.vm = vm;
    }
    get source() { return this.vm.source; }
}
exports.CallCtx = CallCtx;
/**
 * Внешняя функция
 */
class Fun {
    /**
     * Вызов внешней функции
     * @param ctx контекст вызова функции
     * @param args аргументы функции
     */
    apply(ctx, args) {
    }
}
exports.Fun = Fun;
/**
 * Вызов функции без аргументов
 */
class Fun0 extends Fun {
    constructor(fn0) {
        super();
        this.fn0 = fn0;
    }
    apply(ctx, args) {
        return this.fn0(ctx);
    }
}
exports.Fun0 = Fun0;
/**
 * Вызов функции без аргументов
 */
class Fun1 extends Fun {
    constructor(fn1) {
        super();
        this.fn1 = fn1;
    }
    apply(ctx, args) {
        if (args && args.length > 0) {
            return this.fn1(ctx, args[0]);
        }
        else {
            throw new Error(`can't call procedure ${name}`);
        }
    }
}
exports.Fun1 = Fun1;
/**
 * Вызов функции без аргументов
 */
class Fun2 extends Fun {
    constructor(fn2) {
        super();
        this.fn2 = fn2;
    }
    apply(ctx, args) {
        if (args && args.length > 1) {
            return this.fn2(ctx, args[0], args[1]);
        }
        else {
            throw new Error(`can't call procedure ${name}`);
        }
    }
}
exports.Fun2 = Fun2;
/**
 * Вызов функции без аргументов
 */
class Fun3 extends Fun {
    constructor(fn3) {
        super();
        this.fn3 = fn3;
    }
    apply(ctx, args) {
        if (args && args.length > 2) {
            return this.fn3(ctx, args[0], args[1], args[2]);
        }
        else {
            throw new Error(`can't call procedure ${name}`);
        }
    }
}
exports.Fun3 = Fun3;
//# sourceMappingURL=ExtFun.js.map