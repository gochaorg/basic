/**
 * Интерфейс подписки на изменения ячеек памяти
 */
export type MemoListener = ( varname:string, from:any, to:any, indexes?:any[] )=>any

/**
 * Память VM
 */
export class Memo {
    /**
     * Непочредственно значния
     */
    readonly values: { [name :string]:any } = {}

    /**
     * Подписчики на изменения значений памяти VM
     */
    readonly listeners: MemoListener[] = []

    /**
     * Выводить на консоль изменения памяти
     */
    debug:boolean = false

    /**
     * Игнорирование регистра символов в именах переменных
     */
    ignoreCase:boolean = true

    /**
     * Чтение значения
     * @param varname имя переменной
     */
    read(varname:string,indexes?:any[]):any { 
        let v = this.values[varname]

        if( v==undefined && this.ignoreCase ){
            const matched = Object.keys(this.values).filter( (x,y,z)=>{ 
                return x.toUpperCase() == varname.toUpperCase(); } 
            );

            if( matched.length>0 ){
                v = this.values[matched[0]]
            }
        }

        if( indexes ){
            const arr:any[] = []
            for( let a of indexes ){ arr.push(a) }
            while( indexes.length>0 ){
                const idx = indexes[0]
                indexes.splice(0,1)
                if( v instanceof Object || v instanceof Array ){
                    v = v[idx]
                }else{
                    v = undefined
                    break
                }
            }
            if( this.debug )console.log(`debug read var ${varname}[${arr}] = ${v}`)
            return v
        }
        return v
    }

    protected emit( varname:string, from:any, to:any, indexes?:any[] ) {
        for( let ls of this.listeners ){
            ls( varname, from, to, indexes )
        }
    }

    /**
     * Запись значения памяти
     * @param varname имя переменной
     * @param value значение переменной
     */
    write(varname:string, value:any,indexes?:any[]) {
        const aindexes:any[] = []
        if( indexes ){
            for( let a of indexes ){ aindexes.push(a) }
        }

        if( indexes ){
            let arr : Array<any> = []
            let v = this.values[varname]
            if( v == undefined && this.ignoreCase ){
                const matchedVarNames = Object.keys(this.values).filter( (x,y,z)=>{ 
                    return x.toUpperCase() == varname.toUpperCase(); } 
                );
                if( matchedVarNames.length>0 ){
                    v = this.values[matchedVarNames[0]]
                }
            }

            if( v instanceof Array 
            ||  v instanceof Object 
            ){
                arr = v
                if( this.debug )console.log(`resolved ${varname} as []`)
            }else{                
                const matchedVarNames = Object.keys(this.values).filter( (x,y,z)=>{ 
                    return x.toUpperCase() == varname.toUpperCase(); } 
                );
                matchedVarNames.forEach( mname => {
                    if( mname!=varname ){
                        const old = this.values[mname];
                        delete this.values[mname];
                        this.emit( mname, old, undefined );
                    }
                });
                this.values[varname] = arr
                if( this.debug )console.log(`assign ${varname} = []`)
            }

            while( indexes.length>1 ){
                const idx = indexes[0]
                indexes.splice(0,1)

                if( arr[idx] instanceof Object || arr[idx] instanceof Array ){
                    arr = arr[idx]
                    if( this.debug )console.log(`resolved [${idx}] as ${typeof(arr)}`)
                }else{
                    arr[idx] = []
                    arr = arr[idx]
                    if( this.debug )console.log(`assign [${idx}] = []`)
                }
            }

            let old = undefined
            if(indexes.length==1){
                const idx = indexes[0]
                old = arr[idx]
                arr[idx] = value
                if( this.debug )console.log(`assign [${idx}] = ${value}`)                
            }

            this.emit( varname, old, value, aindexes );
            return;
        }

        if( this.debug )console.log(`debug write var ${varname} = ${value}`)

        if( this.ignoreCase ){
            const matched = Object.keys(this.values).filter( (x,y,z)=>{ 
                return x.toUpperCase() == varname.toUpperCase(); } 
            );

            matched.forEach( n => {
                if( n!=varname ){
                    const old = this.values[n];
                    delete this.values[n];
                    this.emit(n,old,undefined);
                }
            });
            const old = this.values[varname];
            this.values[varname] = value;
            this.emit(varname,old,value);
        }else{
            const old = this.values[varname];
            this.values[varname] = value;
            this.emit(varname,old,value);
        }
    }

    get varnames():string[] {
        return Object.keys(this.values)
    }
}