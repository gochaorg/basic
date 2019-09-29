import process = require("process")
import fs = require("fs")

export class cmdline {    
    readonly args: string[]
    public constructor(args?:string[]|undefined){
        if( args ){
            this.args = args
        }else{
            this.args = [...process.argv]
        }
    }

    /**
     * Поиск подходящих ключ/значение аргументов и передача значений в функцию
     * @param ptrn шаблоны параметров комадной строки
     * @param opts опции
     */
    matchFirst(
        ptrn: {
            [key:string]:{
                int?:(n:number)=>any,
                num?:(n:number)=>any,
                str?:(s:string)=>any,
                boolean?:(b:boolean)=>any,
                keyOnly?:()=>any,
                asExistsFileOrDir?:()=>any,
                existsFileOrDir?:(filename:string)=>any,
                existsFile?:(filename:string)=>any,
                existsDir?:(filename:string)=>any,
            }
        }, 
        opts?: {
            notMatched?:(arg:string)=>any
        }
    ) : cmdline {
        const args = [...this.args]
        const arg = args.shift()
        if( arg ){
            const mptr = ptrn[arg]
            if( mptr ){
                let matched = 0
                if( mptr.int ){
                    const arg2 = args.shift()
                    if( arg2 ){
                        const n = parseInt(arg2, 10)
                        if( n!==NaN ){
                            mptr.int(n)
                            matched++
                        }else{
                            args.unshift(arg2)
                        }
                    }
                }
                if( mptr.num ){
                    const arg2 = args.shift()
                    if( arg2 ){
                        const n = parseFloat(arg2)
                        if( n!==NaN ){
                            mptr.num(n)
                            matched++
                        }else{
                            args.unshift(arg2)
                        }
                    }
                }
                if( mptr.str ){
                    const arg2 = args.shift()
                    if( arg2 ){
                        mptr.str(arg2)
                        matched++
                    }
                }
                if( mptr.boolean ){
                    const arg2 = args.shift()
                    if( arg2 ){
                        if( arg2=="1" || 
                            arg2.toLowerCase()=="true" || 
                            arg2.toLowerCase()=="yes" || 
                            arg2.toLowerCase()=="on" ){
                            mptr.boolean(true)
                            matched++
                        }else if( arg2=="0" || 
                            arg2.toLowerCase()=="false" || 
                            arg2.toLowerCase()=="no" || 
                            arg2.toLowerCase()=="off" 
                        ){
                            mptr.boolean(false)
                            matched++
                        }else{
                            args.unshift(arg2)
                        }
                    }
                }
                if( mptr.keyOnly ){
                    mptr.keyOnly()
                    matched++
                }
                if( mptr.asExistsFileOrDir ){
                    if( fs.existsSync(arg) ){
                        mptr.asExistsFileOrDir()
                        matched++
                    }else{
                        args.unshift(arg)
                    }
                }
                if( mptr.existsFileOrDir ){
                    const arg2 = args.shift()
                    if( arg2 ){
                        if( fs.existsSync(arg2) ){
                            mptr.existsFileOrDir(arg2)
                            matched++
                        }else{
                            args.unshift(arg2)
                        }
                    }
                }
                if( mptr.existsFile ){
                    const arg2 = args.shift()
                    if( arg2 ){
                        if( fs.existsSync(arg2) && fs.statSync(arg2).isFile() ){
                            mptr.existsFile(arg2)
                            matched++
                        }else{
                            args.unshift(arg2)
                        }
                    }
                }
                if( mptr.existsDir ){
                    const arg2 = args.shift()
                    if( arg2 ){
                        if( fs.existsSync(arg2) && fs.statSync(arg2).isDirectory() ){
                            mptr.existsDir(arg2)
                            matched++
                        }else{
                            args.unshift(arg2)
                        }
                    }
                }
                if( matched<0 ){
                    if( opts && opts.notMatched ){
                        opts.notMatched(arg)
                    }
                }
            }else{
                if( opts && opts.notMatched ){
                    opts.notMatched(arg)
                }
            }
        }
        return new cmdline(args)
    }

    /**
     * Поиск подходящих ключ/значение аргументов и передача значений в функцию
     * @param ptrn шаблоны параметров комадной строки
     */
    matchAll(
        ptrn: {
            [key:string]:{
                int?:(n:number)=>any,
                num?:(n:number)=>any,
                str?:(s:string)=>any,
                boolean?:(b:boolean)=>any,
                keyOnly?:()=>any,
                asExistsFileOrDir?:()=>any,
                existsFileOrDir?:(filename:string)=>any,
                existsFile?:(filename:string)=>any,
                existsDir?:(filename:string)=>any,
            }
        }
    ) : cmdline {
        let cl : cmdline = this
        while( true ){
            if( cl.args.length<=0 )break
            cl = cl.matchFirst( ptrn )            
        }
        return cl
    }
}
