import * as Basic from '../../src/ast/Parser'

import * as chai from 'chai';
import 'mocha'
import { describe, it } from 'mocha';

const assTrue = chai.assert.isTrue
const assExists = chai.assert.exists

console.log( "======================================================" )
console.log( 'Parser 3')
console.log( "======================================================" )

interface TestExp {
    debug?: boolean,
    json?:boolean,
    code: string,
    parseFn: (parser:Basic.Parser) => any
}

let testExpressions:TestExp[] = [
    //{ statement: '10 + 8*3', parseFn: (p)=>p.expression() },
    //{ code: '10 GOTO 20', parseFn: (p)=>p.statement(), json:true, debug:false },
    //{ code: '10 IF a>1 THEN GOTO 20 ELSE GOTO 22', parseFn: (p)=>p.statement(), json:true, debug:false },
    { code: 'IF a>1 THEN GOTO 20 ELSE GOTO 22', parseFn: (p)=>p.statement(), json:true, debug:false },
]

console.log("== parse statements ============")
testExpressions.forEach( texp => {
    console.log( "\ncode:  ",texp.code )
    
    let parser = Basic.Parser.create( texp.code )
    if( texp.debug!=undefined )parser.debug = texp.debug

    let presult = texp.parseFn( parser )
    if( texp.json && presult ){
        console.log( "result (json):" )
        console.log( JSON.stringify(presult,null,4) )
    }else{
        console.log( "result:",presult )
    }
})
