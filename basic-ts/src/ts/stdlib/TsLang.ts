import { BasicVm } from "../vm/BasicVm";
import { Fun1 } from "../vm/ExtFun";
import { Memo } from "../vm/Memo";

export function register(memo:Memo){
    memo.write('LEN', new Fun1( (ctx,a) => {
        if( a instanceof Array ){
            return a.length
        }else if( a instanceof String ){
            return a.length
        }else if( typeof(a)=='string' ){
            return a.length
        }
        //return typeof(a);
    }));
}