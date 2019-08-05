import * as Basic from '../../ts/ast/Parser'
import { Statement } from '../../ts/ast/Statement';
import { BinaryOpExpression, UnaryOpExpression } from '../../ts/ast/OperatorExp';
import { astToBasic } from '../../ts/ast/AstToBasic';

console.log('== Basic parser ==')
// console.log(
//     Basic.Parser.create(
//         '10 REM comments\n'+
//         '12 REM comment 2'
//     ).statements()
// )

interface TestExp {
    debug?: boolean,
    json?:boolean,
    toBasic?:boolean,
    code: string,
    parseFn: (parser:Basic.Parser) => any
}

let testExpressions:TestExp[] = [
    //{ code: 'A + B ^ C', parseFn: (p)=>p.expression(), debug:false },
    //{ code: 'A IMP B', parseFn: (p)=>p.expression() },
    //{ code: 'A EQV B OR ( C XOR D OR E AND F )', parseFn: (p)=>p.expression(), json:true },
    //{ code: 'NOT B AND E', parseFn: (p)=>p.expression() },
    //{ code: '2 < 3 AND 3 > 2 AND 4 = 4', parseFn: (p)=>p.expression(), json:true },
    //{ code: '2 <= 3 AND 3 => 2 AND 4 <> 5', parseFn: (p)=>p.expression(), json:true },
    //{ code: '2 => 3 AND 3 >= 2 AND 4 >< 5', parseFn: (p)=>p.expression(), json:true },
    { code: '-1', parseFn: (p)=>p.expression(), json:true },
    { code: '-1-2', parseFn: (p)=>p.expression(), json:true, toBasic: true },
    { code: '10*2+7', parseFn: (p)=>p.expression(), debug:true, json:false, toBasic: true },
    { code: '2+7+3', parseFn: (p)=>p.expression(), debug:false, json:false, toBasic: true },
    { code: '2*7*3', parseFn: (p)=>p.expression(), debug:false, json:false, toBasic: true },
]

testExpressions.forEach( texp => {
    console.log( "\ncode:  ",texp.code )
    
    let parser = Basic.Parser.create( texp.code )
    if( texp.debug!=undefined )parser.debug = texp.debug

    let presult = texp.parseFn( parser )
    
    if( texp.toBasic ){
        if( presult instanceof BinaryOpExpression 
        ||  presult instanceof UnaryOpExpression
        ){
            console.log("toBasic: ",astToBasic(presult))
        }
    }

    if( texp.json && presult ){
        console.log( "result (json):" )
        console.log( JSON.stringify(presult,null,4) )
    }else{
        console.log( "result:",presult )
    }
})