import * as su from '../../src/vm/SourceUnit'
import { astToBasic } from '../../src/ast/AstToBasic'

import * as chai from 'chai';
import 'mocha'
import { describe, it } from 'mocha';
import { Statement } from './Statement';

let su1 = new su.SourceUnit

let catchedImmediateSt : Statement[] = []

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
            catchedImmediateSt = commands
        }
    }
)

//console.log( astToBasic(su1.line(30).statement) )

const assTrue = chai.assert.isTrue
const assExists = chai.assert.exists

describe( "Ast to basic", ()=>{
    it( "fetch 30", ()=>{
        const l30 = astToBasic(su1.line(30).statement)
        assExists(l30)
        assTrue(typeof(l30)=="string")
        assTrue(l30.startsWith("30 PRINT"))
    })

    it( "catched immediateStatements", ()=>{
        assExists(catchedImmediateSt)
        assTrue(catchedImmediateSt.length>0)
    })
})
