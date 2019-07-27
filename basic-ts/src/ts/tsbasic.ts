import process = require("process");
import fs from 'fs';
import { SourceUnit } from "./vm/SourceUnit";
import { BasicVm } from "./vm/BasicVm";

class Args {
    readonly commands:(()=>any)[] = []
}

interface cmdProc {
    (rargs:Args, cargs:string[]):cmdProc
}

/**
 * Обработка параметров командной строки
 * @param args параметры командной строки
 */
function processArgs(commandLineArgs:string[]) {
    const res:Args = new Args()

    let stop : cmdProc = (r,a) => {return stop}

    let parseArgs : cmdProc = (q,args) => {
        if( /(\-|\-\-|\/)(\?|help)/.test(args[0]) ){
            args.shift()
            q.commands.push( ()=>{showHelp()} )
            return init
        }

        if( args.length>1 && (args[0]=='-r' || args[0]=='--run') ){
            args.shift()
            const filename = args.shift()
            if( filename ){
                q.commands.push( ()=>{runFile(filename)} )
            }
        }

        args.shift()
        return parseArgs
    }
    
    let init : cmdProc = (q,args) => {
        if(args.length<1)return stop
        
        if( args.length==1 ){
            const tryFilename = args[0]
            const tryFileSt = fs.statSync(tryFilename)
            if(tryFileSt.isFile()){
                args.shift()
                q.commands.push( ()=>{
                    runFile(tryFilename)
                })
                return stop
            }
        }

        return parseArgs
    }

    const argz:string[] = [...commandLineArgs]
    let parse : cmdProc = init

    while(argz.length>0){
        const r = parse(res,argz)
        if( r==stop ){
            break
        }
        parse = r
    }

    return res
}

/**
 * Выполнить файл
 * @param filename имя файла
 */
function runFile(filename:string) {
    //console.log(`run file ${filename}`)
    const basicSrc = fs.readFileSync(filename, {encoding:'utf-8'})
    const su = new SourceUnit().parse(basicSrc)
    const vm = new BasicVm(su)
    vm.ip = 0
    while( vm.hasNext() ){
        vm.next()
    }
}

/**
 * Отобразить справку
 */
function showHelp(){
    console.log("show help")
}

processArgs(process.argv).commands.forEach( a => a() )