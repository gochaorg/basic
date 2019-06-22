"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function notifable(owner, prop, desc) {
    var oget = desc.get;
    var oset = desc.set;
    if (oset && oget) {
        desc.set = function (v) {
            var readed = oget.apply(this);
            console.log("notify change: " + readed + " => " + v, owner);
            oset.apply(this, [v]);
            return v;
        };
    }
}
var SomeClass = /** @class */ (function () {
    function SomeClass() {
        this._value = 1;
    }
    Object.defineProperty(SomeClass.prototype, "value", {
        get: function () {
            var res = this._value;
            return res;
        },
        set: function (v) {
            this._value = v;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        notifable
    ], SomeClass.prototype, "value", null);
    return SomeClass;
}());
console.log("test decorator");
var s1 = new SomeClass();
console.log("read " + s1.value);
s1.value = 2;
console.log("writed " + s1.value);
s1.value = 4;
console.log("writed " + s1.value);
//# sourceMappingURL=DecoratorTest.js.map