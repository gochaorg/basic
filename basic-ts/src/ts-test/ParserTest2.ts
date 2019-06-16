import * as Basic from '../ts/ast/Parser'

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
    code: string,
    parseFn: (parser:Basic.Parser) => any
}

let testExpressions:TestExp[] = [
    //{ statement: '10 + 8*3', parseFn: (p)=>p.expression() },
    { code: '10 REM hello', parseFn: (p)=>p.statement(), json:true },
    { code: '10 LET a = 1', parseFn: (p)=>p.statement(), json:true },
    { code: '10 LET b = c < d', parseFn: (p)=>p.statement(), json:true },
    { code: 
        '10 REM cmnt\n'+
        '20 LET b = c < d'
        , parseFn: (p)=>p.statements() },
    { code: 
        '10 REM cmnt\n'+
        '20 LET b = a\n'+
        'RUN 10'
        , parseFn: (p)=>p.statements()
        , debug: false
     },
]

console.log("== parse statements ============")
testExpressions.forEach( texp => {
    console.log( "\ncode:  ",texp.code )
    
    let parser = Basic.Parser.create( texp.code )
    if( texp.debug!=undefined )parser.debug = texp.debug

    let presult = texp.parseFn( parser )
    if( texp.json && presult ){
        console.log( "result (json):" )
        console.log( JSON.stringify(presult,null,4) )
    }else{
        console.log( "result:",presult )
    }
})
