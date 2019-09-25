import * as su from 'ts-basic-core/vm/SourceUnit'

const a = su.parse( '10 REM cmnt\n'+
    '20 LET b = 10*2+7\n'+
    '22 GOTO 10\n'+
    '24 LET A = B(10,2)\n'+
    '30 PRINT "Hello"\n'+
    'RUN 10'
)
console.log( a )
