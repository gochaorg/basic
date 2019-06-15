import * as LX from '../ts/ast/Lexer'

console.log( '===== BASIC --------=========================================' )
let lexs1 = LX.parseBasicLexs( 
    '10 REM aa\n'+
    '20 LET A = 12 * 4\n\r'+
    '30 LET B = 24\r\n'+
    '99 REM finish\r\n'
)

let lines = LX.filter(lexs1).lines
for( let li=0; li<lines.length; li++ ){
    console.log( "line "+li )
    console.log( "----------------" )
    
    let line = lines[li]
    console.log( line )
}
