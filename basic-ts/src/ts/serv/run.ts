import fs from 'fs';
import { Conf } from './Conf';

// конфигурация
const conf = new Conf()

/** Обработка параметров командной строки */
function processCmdLine(){
    const cmdline:string[] = [...process.argv]
    while( cmdline.length>0 ){
        const arg = cmdline.shift()
        if( arg=='-root'){
            const rootDir = cmdline.shift()
            if( rootDir ){
                conf.root = rootDir
            }
        }else if( arg=='-port' ){
            const portnumStr = cmdline.shift()
            if( portnumStr ){
                const portnum = parseInt(portnumStr, 10)
                if( portnum!==NaN ){
                    conf.port = portnum
                }
            }
        }
    }
}

processCmdLine()

// const jsnText = fs.readFileSync('src/test/serv/conf.json',{encoding:'utf-8'})
// const jsnConf = JSON.parse(jsnText)
// console.log(jsnConf)