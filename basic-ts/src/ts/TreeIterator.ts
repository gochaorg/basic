/**
 * Обход дерева
 */
export class TreeIt<T> {
    readonly follow: (from:T)=>T[]    
    protected current:T[]
    constructor( start:T, follow:(from:T)=>T[] ){
        this.follow = follow
        this.current = [ start ]
    }

    hasNext():boolean {
        return this.current.length > 0
    }

    fetch():T|undefined {
        if( this.current.length<=0 )return undefined
        let res:T[]|undefined = this.current.splice(0,1)
        //let res:T|undefined = this.current.pop()
        if( res!=undefined ){
            res.forEach( r=>{
                this.follow(r).forEach( n=>this.current.push(n) )
            })
        }
        if( res!=undefined ){
            return res.length>0 ? res[0] : undefined
        }
        return undefined
    }

    static each<T>( start:T, follow:(from:T)=>T[], consumer:(n:T)=>any ){
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

    static list<T>( start:T, follow:(from:T)=>T[] ):T[] {
        if( start==null || start==undefined )throw new Error("illegal arg start")
        if( follow==null || follow==undefined )throw new Error("illegal arg follow")
        let arr:T[] = []
        TreeIt.each( start, follow, (n:T)=>{ arr.push(n) } )
        return arr
    }
}