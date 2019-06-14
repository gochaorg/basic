import * as su from '../ts/vm/SourceUnit'
import { BasicVm } from '../ts/vm/BasicVm'
import { Memo } from '../ts/vm/Memo'

console.log('== BasicVM test ==')
const src1 = 
    '10 REM cmnt\n'+
    '20 LET b = 1 + 3'

console.log( "source:", src1 )
let su1 = su.parse(src1)
//console.log( su1.find(20) )
console.log( "parsed:",su1 )

console.log("-- eval -----------------")
let vm = new BasicVm(su1)
vm.evalStatement( su1.line(20).statement )

console.log("-- memo -----------------")
console.log( vm.memo.values )