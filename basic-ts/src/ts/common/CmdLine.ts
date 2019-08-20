/**
 * Работа с командной строкой
 */
export const cmdline = {
    args: [...process.argv],
    shift: ()=>{ return cmdline.args.shift() },
    match: ( 
        ptrn:{
            [key:string]:{
                int?:(n:number)=>any,
                num?:(n:number)=>any,
                str?:(s:string)=>any
            }
        },
        cycle:boolean = true
    )=>{
        const parse = ()=>{
            const arg = cmdline.shift()
            if( arg ){
                const mptr = ptrn[arg]
                if( mptr ){
                    if( mptr.int ){
                        const arg2 = cmdline.shift()
                        if( arg2 ){
                            const n = parseInt(arg2, 10)
                            if( n!==NaN ){
                                mptr.int(n)
                            }
                        }
                    }
                    if( mptr.num ){
                        const arg2 = cmdline.shift()
                        if( arg2 ){
                            const n = parseFloat(arg2)
                            if( n!==NaN ){
                                mptr.num(n)
                            }
                        }
                    }
                    if( mptr.str ){
                        const arg2 = cmdline.shift()
                        if( arg2 ){
                            mptr.str(arg2)
                        }
                    }
                }
            }
        }

        if( cycle ){
            while( cmdline.args.length>0 ){
                parse()
            }
        }else{
            parse()
        }
    }
}