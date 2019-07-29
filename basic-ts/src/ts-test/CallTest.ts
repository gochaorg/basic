import * as su from '../ts/vm/SourceUnit'
import { BasicVm } from '../ts/vm/BasicVm'
import { Memo } from '../ts/vm/Memo'
import { ExtFun, ExtFun0 } from '../ts/vm/ExtFun';

console.log('== call test ==')
const src1 = 
    '10 CALL TEST1'

console.log( "source:", src1 )
const su1 = su.parse(src1)
console.log( "parsed:",su1 )

const vm1 = new BasicVm(su1)
const fnTEST1 = new ExtFun0( ctx=>{
    console.log("procedure called")
})
vm1.memo.write('TEST1',fnTEST1)

console.log("run")
vm1.ip = 0
while( vm1.hasNext() ){
    vm1.next()
}