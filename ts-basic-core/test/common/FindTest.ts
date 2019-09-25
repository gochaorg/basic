import * as bfind from '../../src/common/Finds'

import * as chai from 'chai';
import 'mocha'
import { describe, it } from 'mocha';

const assTrue = chai.assert.isTrue
const assExists = chai.assert.exists

console.log( "======================================================" )
console.log( 'Finds')
console.log( "======================================================" )

let arr1 : string[] = [ 'a', 'b', 'r', 'r', 'c', 'c', 'd', 'f', 'r','r','r','r','r','r','r','r', 'e', 'z', 'aa', 'ab' ]
const srtFn = (a:string,b:string) => a.localeCompare(b)
arr1 = arr1.sort( srtFn )
console.log( "arr:", arr1 )

console.log( bfind.find(arr1,srtFn,'r') )
console.log( bfind.findFirst(arr1,srtFn,'c') )
