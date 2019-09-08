import { TreeIt } from '../../src/common/TreeIt'

import * as chai from 'chai';
import 'mocha'
import { describe, it } from 'mocha';


interface Foo {
    [key: string]: string[];
}

const treedata : Foo = { 
    // parent -> children
    "a": ["b", "c"],
    "b": ["d", "e"],
    "c": ["f", "g"],
    "d": ["h", "i"]
}

const treePaths = TreeIt.list("a", (n:string) => {
    let ch = treedata[n]
    if( ch ){
        return ch
    }
    return []
}).map( x => x.path.reduce( (a,b)=>a+"/"+b ));

treePaths.forEach( p => console.log(p) )

describe( "TreeIt testing", ()=>{
    it('node follow to list', ()=>{
        chai.assert.isTrue( treePaths.indexOf('a/b/d/h') >= 0 )
        chai.assert.isTrue( treePaths.indexOf('a/b/d/i') >= 0 )
    })
})