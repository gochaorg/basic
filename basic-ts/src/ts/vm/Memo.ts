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
     * Чтение значения
     * @param varname имя переменной
     */
    read(varname:string,indexes?:any[]):any { 
        let v = this.values[varname]
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
            console.log(`debug read var ${varname}[${arr}] = ${v}`)
            return v
        }
        return v
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
            if( this.values[varname] instanceof Array 
            ||  this.values[varname] instanceof Object 
            ){
                arr = this.values[varname]
                console.log(`resolved ${varname} as []`)
            }else{
                this.values[varname] = arr
                console.log(`assign ${varname} = []`)
            }

            while( indexes.length>1 ){
                const idx = indexes[0]
                indexes.splice(0,1)

                if( arr[idx] instanceof Object || arr[idx] instanceof Array ){
                    arr = arr[idx]
                    console.log(`resolved [${idx}] as ${typeof(arr)}`)
                }else{
                    arr[idx] = []
                    arr = arr[idx]
                    console.log(`assign [${idx}] = []`)
                }
            }

            let old = undefined
            if(indexes.length==1){
                const idx = indexes[0]
                old = arr[idx]
                arr[idx] = value
                console.log(`assign [${idx}] = ${value}`)                
            }

            for( let ls of this.listeners ){
                ls( varname, old, value, aindexes )
            }

            return
        }

        console.log(`debug write var ${varname} = ${value}`)
        const old = this.values[varname]
        this.values[varname] = value
        for( let ls of this.listeners ){
            ls( varname, old, value )
        }
    }

    get varnames():string[] {
        return Object.keys(this.values)
    }
}