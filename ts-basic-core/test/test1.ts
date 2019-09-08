import * as chai from 'chai';
import 'mocha'
import { describe, it } from 'mocha';

describe( 'aaa', ()=>{
    it('try1', ()=>{
        const a=1*3
        const b=2
        return chai.assert.isTrue( a===b )
    })
})