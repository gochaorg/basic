/**
 * Интерфейс подписки на изменения ячеек памяти
 */
export type MemoListener = ( varname:string, from:any, to:any )=>any

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
    read(varname:string):any {
        console.log(`debug read var ${varname}`)
        return this.values[varname]
    }

    /**
     * Запись значения памяти
     * @param varname имя переменной
     * @param value значение переменной
     */
    write(varname:string, value:any) {
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