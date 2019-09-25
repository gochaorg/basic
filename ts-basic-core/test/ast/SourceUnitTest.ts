import * as su from '../../src/vm/SourceUnit'

import * as chai from 'chai';
import 'mocha'
import { describe, it } from 'mocha';

const assTrue = chai.assert.isTrue
const assExists = chai.assert.exists

console.log( "======================================================" )
console.log( 'Source unit')
console.log( "======================================================" )

let su1 = new su.SourceUnit

//su1 = su1.set( 10, 'Line 1' ).set( 5, 'line0' ).set( 15, 'line15' ).set( 12, 'line12' )
//console.log( su1.lines )
//console.log( 'find', su1.find(10) )

console.log( "parsing" )
su1 = su1.parse( 
    '10 REM cmnt\n'+
    '20 LET b = a\n'+
    'RUN 10',
    {
        immediateStatements(commands){
            console.log("immediate commands")
            commands.forEach( cmd => console.log(cmd))
        }
    }
 )

console.log( "parsed" )
console.log( su1.lines )