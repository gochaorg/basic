import * as su from 'ts-basic-core/vm/SourceUnit'
import { BasicVm } from 'ts-basic-core/vm/BasicVm';
import { astToBasic } from 'ts-basic-core/ast/AstToBasic';
import * as tslang from '../../src/stdlib/TsLang';

import * as chai from 'chai';
import 'mocha'
import { describe, it } from 'mocha';

const assTrue = chai.assert.isTrue
const assExists = chai.assert.exists

console.log( "======================================================" )
console.log( "Basic TsLang fn test" )
console.log( "======================================================" )

describe( "test LEN", ()=>{
    it( "Len of str", ()=>{
        console.log( "parse" )
        const su1 = su.parse( 
            '10 LET str1 = "str123"\n'+
            '20 LET len1 = LEN( str1 )\n'
        )
        console.log( "parsed", su1 )

        const vm1 = new BasicVm(su1)
        tslang.register( vm1.memo )
        console.log( "registerd funs" )
        
        console.log( "start execute")
        vm1.ip = 0

        let cnt=0
        while( cnt<100 ){ 
            cnt++
            if( vm1.hasNext() ){
                const nextst = vm1.source.lines[vm1.ip]
                console.log( "next statement",{
                    ip: vm1.ip, 
                    st: nextst!=null ? astToBasic( nextst.statement ) : null,
                })
    
                const execSucc = vm1.next()
                if( !execSucc ){
                    console.log( "break by err", {hasNext:vm1.hasNext()})
                    break
                }else{
                    console.log( "execute sussess" )
                }
            }else{
                console.log( "finish execute")
                break
            }
        }

        console.log( "memo",vm1.memo )
        assExists( vm1.memo.read('str1') )
        assExists( vm1.memo.read('len1') )
        assTrue( vm1.memo.read('len1') == 6 )
    })
})

