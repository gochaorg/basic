import * as cmd from 'ts-cmdline-prsr/cmdline'
import * as su from 'ts-basic-core/vm/SourceUnit'
import { BasicVm } from 'ts-basic-core/vm/BasicVm';
import { Memo } from 'ts-basic-core/vm/Memo';
import { astToBasic } from 'ts-basic-core/ast/AstToBasic';
import * as tslang from 'ts-basic-stdlib/stdlib/TsLang';
import fs = require('fs');

/** Отображение справки по коммандной строке */
function help(){
    console.log( "help for tbasic" );

    const appname = 'tbasic-cli';
    console.log( `command line syntax:` );
    console.log( `    ${appname} {<options>}` );
    console.log( "where options ie key/value pairs:" )
    console.log( "    -f <filename>" )
    console.log( "       define executed basic script" )
    console.log( "    -e <encoding>" )
    console.log( "       define encoding of basic script files." )
    console.log( "       default is utf-8" )
    console.log( "    -showAst <filename>" )
    console.log( "       show ast tree of file" )
}

/** Текущая кодировка файлов */
let fileEncoding = 'utf-8';

/** Смена текущей кодировки */
function changeInputEncoding( name:string ) {
    fileEncoding = name;
}

/** Создание виртуальной машины */
function buildVm(su: su.SourceUnit, memo?:Memo):BasicVm {
    const vm = memo !=null ? new BasicVm(su,memo) : new BasicVm(su);
    tslang.register( vm.memo )
    return vm;
}

/** Парсинг файла */
function parseFile(filename:string):su.SourceUnit {
    return su.parse( fs.readFileSync(filename,fileEncoding) )
}

/** Выполнение программы BASIC внутри виртуальной машины */
function runVm(vm:BasicVm) {
    vm.ip = 0
    while( true ){
        if( !vm.hasNext() )break
        const stmt = vm.source.lines[vm.ip]
        const succ = vm.next();
        if( !succ ){
            const stTxt = stmt!=null && stmt.statement!=null ? astToBasic(stmt.statement) : null
            console.error("err:",{
                statement: stTxt
            });
            break;
        }
    }
}

/** Выполнение файла */
function executeFile(filename:string){
    //console.log( "execute",fileName );
    const su1 = parseFile( filename );
    const vm1 = buildVm( su1 );
    runVm( vm1 );
}

/** Показать ast дерево файла */
function showAst(filename:string) {
    const su1 = parseFile( filename );
    console.log( JSON.stringify(su1,undefined,2) );
}

const cmdline = new cmd.cmdline();
if( cmdline.args.length<3 ){
    help()
}else{
    cmdline.matchAll({
        "-e": { str: changeInputEncoding },
        "-f": { existsFile: executeFile },
        "-showAst": { existsFile: showAst },

        "-help" : { keyOnly: help },
        "--help" : { keyOnly: help },
        "-?" : { keyOnly: help },
        "/?" : { keyOnly: help }
    })
}