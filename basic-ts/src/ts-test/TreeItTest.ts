import { TreeIt } from '../ts/TreeIt'

interface Foo {
    [key: string]: string[];
 } 
let treedata : Foo = { 
    // parent -> children
    "a": ["b", "c"],
    "b": ["d", "e"],
    "c": ["f", "g"],
    "d": ["h", "i"]
}

console.log( TreeIt.list("a", (n:string) => {
    let ch = treedata[n]
    if( ch ){
        return ch
    }
    return []
}).map( x => x.path.reduce( (a,b)=>a+"/"+b ))
);

let arr : number[] = [1]
let r1 = arr.reduce( (a,b)=>{console.log("reduce=",a,b) ;return a+b}, 0 )
console.log(r1)