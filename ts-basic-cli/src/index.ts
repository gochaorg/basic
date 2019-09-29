import * as cmd from 'ts-cmdline-prsr/cmdline'
import * as su from 'ts-basic-core/vm/SourceUnit'

function help(){
    console.log( "help" );
}

//function buildVm(su:SourceUnit)

function executeFile(fileName:string){
    console.log( "execute",fileName );
}

const cmdline = new cmd.cmdline();
if( cmdline.args.length<3 ){
    help()
}else{
    cmdline.matchAll({
        "-f": { existsFile: executeFile },

        "-help" : { keyOnly: help },
        "--help" : { keyOnly: help },
        "-?" : { keyOnly: help },
        "/?" : { keyOnly: help }
    })
}