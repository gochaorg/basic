import * as su from '../ts/vm/SourceUnit'
import { astToBasic } from '../ts/ast/AstToBasic'

let su1 = new su.SourceUnit

console.log( "parsing" )
console.log( "======================" )
su1 = su1.parse( 
    '10 REM cmnt\n'+
    '20 LET b = 10*2+7\n'+
    '22 GOTO 10\n'+
    '24 LET A = B(10,2)\n'+
    '30 PRINT "Hello"\n'+
    'RUN 10',
    {
        immediateStatements(commands){
            //console.log("== immediate commands ==")
            //commands.forEach( cmd => console.log(cmd))
        }
    }
)

console.log( astToBasic(su1.line(30).statement) )
