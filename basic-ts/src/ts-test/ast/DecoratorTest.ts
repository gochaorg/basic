function notifable(owner:any,prop:string,desc:PropertyDescriptor){
    const oget = desc.get
    const oset = desc.set
    if( oset && oget ){
        desc.set = function(v) {
            const readed = oget.apply(this)
            console.log( `notify change: ${readed} => ${v}`, owner)
            oset.apply(this,[v])
            return v
        }
    }
}

class SomeClass {
    private _value:number = 1
    get value(){ 
        const res = this._value
        return  res
    }
    @notifable
    set value(v:number){ 
        this._value = v 
    }
}

console.log("test decorator")
const s1 = new SomeClass()
console.log( `read ${s1.value}`)
s1.value = 2
console.log( `writed ${s1.value}`)
s1.value = 4
console.log( `writed ${s1.value}`)