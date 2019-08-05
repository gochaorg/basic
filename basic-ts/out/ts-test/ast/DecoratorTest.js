"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function notifable(owner, prop, desc) {
    const oget = desc.get;
    const oset = desc.set;
    if (oset && oget) {
        desc.set = function (v) {
            const readed = oget.apply(this);
            console.log(`notify change: ${readed} => ${v}`, owner);
            oset.apply(this, [v]);
            return v;
        };
    }
}
class SomeClass {
    constructor() {
        this._value = 1;
    }
    get value() {
        const res = this._value;
        return res;
    }
    set value(v) {
        this._value = v;
    }
}
__decorate([
    notifable
], SomeClass.prototype, "value", null);
console.log("test decorator");
const s1 = new SomeClass();
console.log(`read ${s1.value}`);
s1.value = 2;
console.log(`writed ${s1.value}`);
s1.value = 4;
console.log(`writed ${s1.value}`);
//# sourceMappingURL=DecoratorTest.js.map