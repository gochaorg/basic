import * as su from '../../src/vm/SourceUnit'
import { BasicVm } from '../../src/vm/BasicVm'
import { Memo } from '../../src/vm/Memo'
import { Fun, Fun0, Fun2 } from '../../src/vm/ExtFun';
import { astToBasic } from '../../src/ast/AstToBasic';

import * as chai from 'chai';
import 'mocha'
import { describe, it } from 'mocha';

const assTrue = chai.assert.isTrue
const assExists = chai.assert.exists

console.log( "======================================================" )
console.log( 'Call test')
console.log( "======================================================" )

const src1 = 
    '10 CALL LIST\n'+
    '12 CALL DUMP\n'+
    '20 PRINT SUMM(1,2)'

console.log( "source:", src1 )
const su1 = su.parse(src1)
console.log( "parsed:",su1 )

const vm1 = new BasicVm(su1)
const fnTEST1 = new Fun0( ctx=>{
    console.log("list of source")
    let src = ""
    ctx.source.lines.forEach( sl => {
        src += astToBasic(sl.statement) + "\n"
    })
    console.log(src)
})
vm1.memo.write('LIST',fnTEST1)

vm1.memo.write('DUMP', new Fun0( ctx=>{
    console.log("dump")
    console.log(ctx.vm.memo)
}))

vm1.memo.write('SUMM', new Fun2( (ctx,a,b) => { 
    //console.log("call summ1",a,b)
    if( typeof(a)=='number' && typeof(b)=='number' )return a+b
    if( typeof(a)=='number' && typeof(b)=='string' )return a+b
    if( typeof(a)=='string' && typeof(b)=='string' )return a+b
    if( typeof(a)=='string' && typeof(b)=='number' )return a+b
    return undefined
}))

console.log("run")
vm1.ip = 0
while( vm1.hasNext() ){
    vm1.next()
}