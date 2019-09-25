import * as su from '../../src/vm/SourceUnit'
import { astToBasic } from '../../src/ast/AstToBasic'

import * as chai from 'chai';
import 'mocha'
import { describe, it } from 'mocha';

const assTrue = chai.assert.isTrue
const assExists = chai.assert.exists

let su1 = new su.SourceUnit

console.log( "======================================================" )
console.log( "Ast to json" )
console.log( "======================================================" )

console.log( "parsing" )
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

//console.log( JSON.stringify(su1.line(30).statement,undefined,2) )
//console.log( JSON.stringify(su1,undefined,2) )
