"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ExtFun_1 = require("../vm/ExtFun");
function register(memo) {
    memo.write('LEN', new ExtFun_1.Fun1((ctx, a) => {
        if (a instanceof Array) {
            return a.length;
        }
        else if (a instanceof String) {
            return a.length;
        }
        else if (typeof (a) == 'string') {
            return a.length;
        }
        //return typeof(a);
    }));
}
exports.register = register;
//# sourceMappingURL=TsLang.js.map