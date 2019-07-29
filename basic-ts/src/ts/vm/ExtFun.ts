/**
 * Контекст вызова внешней функции
 */
export class CallCtx {
    procedure?: {
        name: string
    }
}

/**
 * Внешняя функция
 */
export class ExtFun {
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
export class ExtFun0 extends ExtFun {
    readonly fn0:(ctx:CallCtx)=>any
    constructor(fn0:(ctx:CallCtx)=>any) {
        super()
        this.fn0 = fn0;
    }

    apply(ctx:CallCtx, args:any[]):any {
        this.fn0( ctx )
    }
}

/**
 * Вызов функции без аргументов
 */
export class ExtFun1<T> extends ExtFun {
    readonly fn1:(ctx:CallCtx, a:T)=>any
    constructor(fn1:(ctx:CallCtx, a:T)=>any) {
        super()
        this.fn1 = fn1;
    }

    apply(ctx:CallCtx, args:any[]):any {
        if( args && args.length>0 ){
            this.fn1( ctx, args[0] as T )
        }else{
            throw new Error(`can't call procedure ${name}`)
        }
    }
}