import * as Basic from '../../src/ast/Parser'
import * as Ast from '../../src/ast/AstVisitor'

import * as chai from 'chai';
import 'mocha'
import { describe, it } from 'mocha';

const assTrue = chai.assert.isTrue
const assExists = chai.assert.exists

console.log( "======================================================" )
console.log( 'Basic parser / Ast visitor')
console.log( "======================================================" )

const src1 = 
    '10 REM cmnt\n'+
    '20 LET b = a\n'+
    'RUN 10'

console.log( "source:", src1 )

const parser = Basic.Parser.create( src1 )
const ast1 = parser.statements()
console.log( "......................" )
console.log( "parsed ast tree:",ast1 )

console.log( "----------------------" )
console.log( "visit ast tree" )
console.log( "......................" )

let opStack = []
Ast.visit( ast1, {
    statements: {
        begin(statements){ console.log(`BEGIN Statements (${statements.statements.length})`) },
        end(statements){ console.log(`END Statements (${statements.statements.length})`) }
    },
    rem: {
        begin(v){ console.log(
            `COMMENT ${v.rem.comment} ${v.sourceLine}`
        ) }
    },
    let: {
        begin(v){
            console.log(`LET ${v.variable.id} = `)
        }
    },
    operator: {
        binary: {
            begin(v){
                console.log(`BINOP ${v.operator.keyWord}`)
            }
        },
        unary: {
            begin(v){
                console.log(`UNARY ${v.operator.keyWord}`)
            }
        },
        literal: {
            begin(v){ console.log(v.value) }
        },
        varRef: {
            begin(v){ console.log(v.id.id) }
        }
    }
})

describe( "Ast visitor test", ()=>{

})