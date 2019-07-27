/**
 * Шаг очередной итерации
 */
export class TreeStep<T> {
    /**
     * Ссылка на родительский элемент дерева
     */
    readonly parent?: TreeStep<T>

    /**
     * Значение узла дерева
     */
    readonly value:T

    /**
     * Конструктор
     * @param value Значение узла дерева
     * @param parent Ссылка на родительский элемент дерева
     */
    constructor(value:T, parent?:TreeStep<T>){
        this.value = value
        this.parent = parent
    }

    /**
     * Создание дочернего пути/шага при обходе дерева
     * @param value дочернее значение узла
     */
    follow(value:T):TreeStep<T>{
        return new TreeStep<T>(value,this)
    }

    /**
     * Возвращает путь значений в дереве
     */
    get path():T[] {
        let res:T[] = []
        let ts:TreeStep<T>|undefined = this
        while( ts!=undefined && ts!=null ){
            res.push( ts.value )
            ts = ts.parent
        }
        res.reverse()
        return res
    }
}

/**
 * Итератор для обхода дерева
 */
export class TreeIt<T> {
    /**
     * Функция перехода к дочерним узлам дерева
     */
    readonly follow: (from:T)=>ReadonlyArray<T>

    /**
     * Текущий набор рабочих узлов
     */
    protected current:TreeStep<T>[]

    /**
     * Конструктор
     * @param start начальный узел дерева
     * @param follow функция перехода к дочерним узлам
     */
    constructor( start:T, follow:(from:T)=>ReadonlyArray<T> ){
        this.follow = follow
        this.current = [ new TreeStep<T>(start) ]
    }

    /**
     * Проверяет наличие дочернего узла
     */
    hasNext():boolean {
        return this.current.length > 0
    }

    /**
     * Переход к следующему узлу в дереве
     */
    fetch():TreeStep<T>|undefined {
        if( this.current.length<=0 )return undefined
        let res:TreeStep<T>[]|undefined = this.current.splice(0,1)
        //let res:T|undefined = this.current.pop()
        if( res!=undefined ){
            res.forEach( r=>{
                this.follow(r.value).forEach( n=>this.current.push(r.follow(n)) )
            })
        }
        if( res!=undefined ){
            return res.length>0 ? res[0] : undefined
        }
        return undefined
    }

    /**
     * Обход узлов дерева
     * @param start начальный узел дерева
     * @param follow функция перехода к дочерним узлам
     * @param consumer функция - визер узлов дерева
     */
    static each<T>( start:T, follow:(from:T)=>ReadonlyArray<T>, consumer:(n:TreeStep<T>)=>any ){
        if( start==null || start==undefined )throw new Error("illegal arg start")
        if( follow==null || follow==undefined )throw new Error("illegal arg follow")
        if( consumer==null || consumer==undefined )throw new Error("illegal arg consumer")
        const titer = new TreeIt<T>(start,follow)
        while( titer.hasNext() ){
            let f = titer.fetch()
            if( f ){
                consumer(f)
            }
        }
    }

    /**
     * Разворчивание дерева в список
     * @param start начальный узел
     * @param follow функция перехода к дочерним узлам
     */
    static list<T>( start:T, follow:(from:T)=>ReadonlyArray<T> ):TreeStep<T>[] {
        if( start==null || start==undefined )throw new Error("illegal arg start")
        if( follow==null || follow==undefined )throw new Error("illegal arg follow")
        let arr:TreeStep<T>[] = []
        TreeIt.each( start, follow, (n:TreeStep<T>)=>{ arr.push(n) } )
        return arr
    }
}