import process = require("process");
import fs from 'fs';
import { SourceUnit } from "./vm/SourceUnit";
import { BasicVm } from "./vm/BasicVm";

/**
 * Аргументы командной строки
 */
class Args {
    /**
     * Последовательно выполняемые команды
     */
    readonly commands:((args:Args)=>any)[] = []

    /**
     * Путь к node.exe
     */
    nodeExe?:string

    /**
     * Выполняемый js файл
     */
    startupJs?:string

    /**
     * Кодировка файла
     */
    encoding:string = 'utf-8'
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

    const argz:string[] = [...commandLineArgs]
    if( argz.length>0 ){
        res.nodeExe = argz.shift()
    }
    if( argz.length>0 ){
        res.startupJs = argz.shift()
    }

    if( argz.length==0 ){
        res.commands.push((a)=>{showHelp(a)})
    }

    let stop : cmdProc = (r,a) => {return stop}
    let parseArgs : cmdProc = (q,args) => {
        if( /(\-|\-\-|\/)(\?|help)/.test(args[0]) ){
            args.shift()
            q.commands.push( (a)=>{showHelp(a)} )
            return init
        }

        if( args.length>1 && (args[0]=='-r' || args[0]=='--run') ){
            args.shift()
            const filename = args.shift()
            if( filename ){
                q.commands.push( ()=>{runFile(filename, q.encoding)} )
            }
            return parseArgs
        }

        if( args.length>1 && args[0]=='--ast2json' ){
            args.shift()
            const filename = args.shift()
            if( filename ){
                let outfile : string | undefined = undefined
                if( args.length>1 && args[0]=='--out' ){
                    args.shift()
                    outfile = args.shift()
                }
                q.commands.push( ()=>{
                    ast2json(filename, q.encoding, outfile)
                })
            }
            return parseArgs
        }

        if( args.length>1 && args[0]=='--encoding' ){
            args.shift()
            q.encoding = args.shift() as string
            return parseArgs
        }

        args.shift()
        return parseArgs
    }
    let init : cmdProc = (q,args) => {
        if(args.length<1){
            return stop
        }
        
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
 * @param encoding кодировка файла
 */
function runFile(filename:string, encoding:string = 'utf-8') {
    //console.log(`run file ${filename}`)
    const basicSrc = fs.readFileSync(filename, {encoding:encoding})
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
function showHelp(a:Args){
    console.log("tsbasic command line syntax:")
    console.log("============================")
    console.log("")
    console.log("common syntax")
    console.log("-------------")
    console.log("    tsbasic ::= `tsbasic` (runFile|keyValues)")
    console.log("    runFile ::= source_file_name")
    console.log("    keyValues ::= { runFileKey ")
    console.log("                  | ast2json")
    console.log("                  | encoding")
    console.log("                  }")
    console.log("    runFileKey ::= (`-r` | `--run` ) source_file_name")
    console.log("    ast2json   ::= `--ast2json` source_file_name [ `--out` output_file_name ]")
    console.log("    encoding   ::= `--encoding` encoding")
    console.log("")
    console.log("run file")
    console.log("--------")
    console.log("    tsbasic basic_file.bas")
    console.log("    tsbasic -r basic_file.bas")
    console.log("    tsbasic --run basic_file.bas")
    console.log("")
    console.log("ast 2 json")
    console.log("----------")
    console.log("    tsbasic --ast2json basic_file.bas --out ast.json")
}

/**
 * Парсинг файла и вывод его дерева AST в файл
 * @param filename basic файл
 * @param encoding кодировка файла
 * @param outputFilename файл в который производиться вывод
 */
function ast2json(filename:string, encoding:string='utf-8', outputFilename?:string){
    const basicSrc = fs.readFileSync(filename, {encoding:encoding})
    const su = new SourceUnit().parse(basicSrc)
    const jsn = JSON.stringify(su,undefined,2)
    if( outputFilename ){
        fs.writeFileSync(outputFilename,jsn,{encoding:encoding})
    }else{
        console.log(jsn)
    }
}

const tsArgs = processArgs(process.argv)
tsArgs.commands.forEach( a => a(tsArgs) )