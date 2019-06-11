import * as su from '../ts/SourceUnit'

let su1 = new su.SourceUnit
su1 = su1.set( 10, 'Line 1' ).set( 5, 'line0' ).set( 15, 'line15' ).set( 12, 'line12' )

console.log( su1.lines )
console.log( 'find', su1.find(10) )