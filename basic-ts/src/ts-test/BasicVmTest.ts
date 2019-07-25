import * as su from '../ts/vm/SourceUnit'
import { BasicVm } from '../ts/vm/BasicVm'
import { Memo } from '../ts/vm/Memo'

console.log('== BasicVM test ==')
const src1 = 
    '10 REM cmnt\n'+
    '20 LET b = 1 + 3'

console.log( "source:", src1 )
const su1 = su.parse(src1)
//console.log( su1.find(20) )
console.log( "parsed:",su1 )

console.log("-- eval -----------------")
const vm1 = new BasicVm(su1)
vm1.evalStatement( su1.line(20).statement )

console.log("-- memo -----------------")
console.log( vm1.memo.values )

///////////////////////////////////////////////
console.log( "-----------------------------")
const src2 = 
    '10 LET a = 1\n'+
    '20 GO SUB 100\n'+
    '30 GOTO 200\n'+
    '100 LET a = 2\n'+
    '109 RETURN\n'+
    '200 LET b = 3\n'+
    '202 PRINT a,b'
const su2 = su.parse(src2)
console.log(su2)

const vm2 = new BasicVm(su2)
vm2.ip = 0

for( let i=0; i<100; i++ ){
    if( vm2.hasNext() ){
        const r = vm2.next()
        //if( r ){
            console.log(`${i} executed`)
            console.log(vm2.memo)
        // }else{
        //     console.log("finish 2")
        //     break
        // }
    }else{
        console.log("finish 1")
        break
    }
}