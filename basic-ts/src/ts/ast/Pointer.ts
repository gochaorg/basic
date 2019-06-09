import { asInt } from '../Num'

/**
 * Перемещаемый указатель по массиву
 */
export class Pointer<A> {
    /**
     * Сохраненный стек указателей
     */
    readonly stack: number[] = []

    /**
     * Исходный набор значений
     */
    readonly entries: A[]

    /**
     * Конструктор
     * @param entries текст 
     */
    constructor(entries: A[]) {
        this.entries = entries
    }

    protected pointerValue : number = 0
    /**
     * Возвращает указатель
     */        
    get ptr():number {
        return this.pointerValue
    }

    /**
     * Устанавливает текущий казатель
     */
    set ptr(v:number) {
        this.pointerValue = asInt(v)
    }

    /**
     * Возвращает прзнак что указать достигнул конец списка элементов
     */
    get eof():boolean {
        return this.ptr >= this.entries.length
    }

    /**
     * Смещение указателя на указанное число элементов
     * @param n число элементов
     */
    move(n:number):number {
        this.pointerValue += asInt(n)
        return this.pointerValue
    }

    /**
     * Сохранение текущего указателя в стеке
     */
    push(){
        this.stack.push( this.ptr )
    }

    /**
     * Чтение сохраненного указателя из стека
     */
    peek():number|null {
        if( this.stack.length<=0 )return null
        return this.stack[this.stack.length-1]
    }

    /**
     * Восстановление текущего указатель из стека с удалением значения из стека
     */
    pop():number {
        if( this.stack.length<=0 )throw new Error("stack is empty")
        const v = this.stack.pop()
        if( v!==undefined ){
            this.ptr = v
        }
        return this.ptr
    }

    /**
     * Удаление верхнего элемента стека без восстановления указателя
     */
    drop():number {
        if( this.stack.length<=0 )throw new Error("stack is empty")
        this.stack.pop()
        return this.ptr            
    }

    /**
     * Полчение значения
     * @param off смещение от текущей позиции
     */
    get(off:number = 0):A|null {
        let t = this.ptr + off
        if( t>=0 && t<this.entries.length ){
            return this.entries[t]
        }
        return null
    }

    /**
     * Получение массива значений
     * @param off смещение от текущей позиции
     * @param cnt максимальное кол-во значений
     */
    fetch( off : number = 0, cnt:number = 1 ):A[] {
        const res : A[] = []
        const start = this.ptr + off

        if( cnt<=0 )return res
        for( let i=0; i<cnt; i++ ){
            let ti = start + i
            if( ti>=0 && ti<this.entries.length ){
                res.push( this.entries[ti] )
            }
        }

        return res
    }

    /**
     * Получение массива значений
     * @param cnt максимальное кол-во значений
     */
    gets( cnt:number=1 ):A[] { return this.fetch(0,cnt) }
}