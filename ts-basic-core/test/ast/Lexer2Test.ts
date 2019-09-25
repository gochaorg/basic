import * as LX from '../../src/ast/Lexer'

import * as chai from 'chai';
import 'mocha'
import { describe, it } from 'mocha';

const assTrue = chai.assert.isTrue
const assExists = chai.assert.exists

console.log( "======================================================" )
console.log( 'Lexer 2 test')
console.log( "======================================================" )

let lexs1 = LX.parseBasicLexs( 
    '10 REM aa\n'+
    '20 LET A = 12 * 4\n\r'+
    '30 LET B = 24\r\n'+
    '99 REM finish\r\n'
)

let lines = LX.filter(lexs1).lines
for( let li=0; li<lines.length; li++ ){
    console.log( "line "+li )
    console.log( "----------------" )
    
    let line = lines[li]
    console.log( line )
}
