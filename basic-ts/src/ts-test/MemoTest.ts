import { Memo } from '../ts/vm/Memo'

console.log('=== test memo ===')

const mem = new Memo()
mem.values['ar1'] = [1,2,3,'a','b','c']
mem.values['ar2'] = [[1,2,3],['a','b','c']]

console.log('read mem: ',mem.read('ar1',[1]))
console.log('read mem: ',mem.read('ar1',[4]))

console.log('read mem: ',mem.read('ar2',[0,2]))
console.log('read mem: ',mem.read('ar2',[1,0]))

mem.write('w1',10,[0])
console.log( mem.values )

mem.write('w1',12, [2])
console.log( mem.values )

mem.write('w1',14, [1,2])
console.log( mem.values )

mem.write('w1',15, [1,0])
mem.write('w1',16, [1,1])
console.log( mem.values )