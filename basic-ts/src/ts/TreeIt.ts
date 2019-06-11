/**
 * Шаг очередной итерации
 */
export class TreeStep<T> {
    readonly parent?: TreeStep<T>
    readonly value:T
    constructor(value:T, parent?:TreeStep<T>){
        this.value = value
        this.parent = parent
    }
    follow(value:T):TreeStep<T>{
        return new TreeStep<T>(value,this)
    }
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
 * Обход дерева
 */
export class TreeIt<T> {
    readonly follow: (from:T)=>T[]
    protected current:TreeStep<T>[]

    constructor( start:T, follow:(from:T)=>T[] ){
        this.follow = follow
        this.current = [ new TreeStep<T>(start) ]
    }

    hasNext():boolean {
        return this.current.length > 0
    }

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

    static each<T>( start:T, follow:(from:T)=>T[], consumer:(n:TreeStep<T>)=>any ){
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

    static list<T>( start:T, follow:(from:T)=>T[] ):TreeStep<T>[] {
        if( start==null || start==undefined )throw new Error("illegal arg start")
        if( follow==null || follow==undefined )throw new Error("illegal arg follow")
        let arr:TreeStep<T>[] = []
        TreeIt.each( start, follow, (n:TreeStep<T>)=>{ arr.push(n) } )
        return arr
    }
}