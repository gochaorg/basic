"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Memo = /** @class */ (function () {
    function Memo() {
        this.values = {};
    }
    Memo.prototype.read = function (varname) {
        console.log("debug read var " + varname);
        return this.values[varname];
    };
    Memo.prototype.write = function (varname, value) {
        console.log("debug write var " + varname + " = " + value);
        this.values[varname] = value;
    };
    return Memo;
}());
exports.Memo = Memo;
//# sourceMappingURL=Memo.js.map