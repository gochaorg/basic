import * as su from '../ts/vm/SourceUnit'
import { BasicVm } from '../ts/vm/BasicVm'
import { Memo } from '../ts/vm/Memo'
import { ExtFun, ExtFun0 } from '../ts/vm/ExtFun';
import { astToBasic } from '../ts/ast/AstToBasic';

console.log('== call test ==')
const src1 = 
    '10 CALL LIST\n'+
    '12 CALL DUMP'

console.log( "source:", src1 )
const su1 = su.parse(src1)
console.log( "parsed:",su1 )

const vm1 = new BasicVm(su1)
const fnTEST1 = new ExtFun0( ctx=>{
    console.log("list of source")
    let src = ""
    ctx.source.lines.forEach( sl => {
        src += astToBasic(sl.statement) + "\n"
    })
    console.log(src)
})
vm1.memo.write('LIST',fnTEST1)

vm1.memo.write('DUMP', new ExtFun0( ctx=>{
    console.log("dump")
    console.log(ctx.vm.memo)
}))

console.log("run")
vm1.ip = 0
while( vm1.hasNext() ){
    vm1.next()
}