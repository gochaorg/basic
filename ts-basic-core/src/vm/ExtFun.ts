import { SourceUnit } from "./SourceUnit";
import { CallStatement } from "../ast/CallStatement";
import { BasicVm } from "./BasicVm";
import { AstNode } from "../ast/AstTypes";

/**
 * Контекст вызова внешней функции
 */
export class CallCtx {
    readonly call: AstNode
    readonly vm:BasicVm
    constructor(vm:BasicVm, call:AstNode){
        this.call = call
        this.vm = vm
    }
    get source(): SourceUnit { return this.vm.source }
}

/**
 * Внешняя функция
 */
export abstract class Fun {
    /**
     * Вызов внешней функции
     * @param ctx контекст вызова функции
     * @param args аргументы функции
     */
    apply(ctx:CallCtx, args:any[]):any {
    }
}

/**
 * Вызов функции без аргументов
 */
export class Fun0<Z> extends Fun {
    readonly fn0:(ctx:CallCtx)=>Z
    constructor(fn0:(ctx:CallCtx)=>Z) {
        super()
        this.fn0 = fn0;
    }

    apply(ctx:CallCtx, args:any[]):any {
        return this.fn0( ctx )
    }
}

/**
 * Вызов функции без аргументов
 */
export class Fun1<A,Z> extends Fun {
    readonly fn1:(ctx:CallCtx, a:A)=>Z
    constructor(fn1:(ctx:CallCtx, a:A)=>Z) {
        super()
        this.fn1 = fn1;
    }

    apply(ctx:CallCtx, args:any[]):any {
        if( args && args.length>0 ){
            return this.fn1( ctx, args[0] as A )
        }else{
            throw new Error(`can't call procedure ${name}`)
        }
    }
}

/**
 * Вызов функции без аргументов
 */
export class Fun2<A,B,Z> extends Fun {
    readonly fn2:(ctx:CallCtx, a:A, b:B)=>Z
    constructor(fn2:(ctx:CallCtx, a:A, b:B)=>Z) {
        super()
        this.fn2 = fn2;
    }

    apply(ctx:CallCtx, args:any[]):any {
        if( args && args.length>1 ){
            return this.fn2( ctx, args[0] as A, args[1] as B )
        }else{
            throw new Error(`can't call procedure ${name}`)
        }
    }
}

/**
 * Вызов функции без аргументов
 */
export class Fun3<A,B,C,Z> extends Fun {
    readonly fn3:(ctx:CallCtx, a:A, b:B, c:C)=>Z
    constructor(fn3:(ctx:CallCtx, a:A, b:B, c:C)=>Z) {
        super()
        this.fn3 = fn3;
    }

    apply(ctx:CallCtx, args:any[]):any {
        if( args && args.length>2 ){
            return this.fn3( 
                ctx, 
                args[0] as A, 
                args[1] as B,
                args[2] as C
            )
        }else{
            throw new Error(`can't call procedure ${name}`)
        }
    }
}