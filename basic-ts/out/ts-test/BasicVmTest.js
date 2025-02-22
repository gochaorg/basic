"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var su = __importStar(require("../ts/vm/SourceUnit"));
var BasicVm_1 = require("../ts/vm/BasicVm");
console.log('== BasicVM test ==');
var src1 = '10 REM cmnt\n' +
    '20 LET b = 1 + 3';
console.log("source:", src1);
var su1 = su.parse(src1);
//console.log( su1.find(20) )
console.log("parsed:", su1);
console.log("-- eval -----------------");
var vm1 = new BasicVm_1.BasicVm(su1);
vm1.evalStatement(su1.line(20).statement);
console.log("-- memo -----------------");
console.log(vm1.memo.values);
///////////////////////////////////////////////
console.log("-----------------------------");
var src2 = '10 LET a = 1\n' +
    '20 GO SUB 100\n' +
    '30 GOTO 200\n' +
    '100 LET a = 2\n' +
    '109 RETURN\n' +
    '200 LET b = 3\n' +
    '202 PRINT a,b';
var su2 = su.parse(src2);
console.log(su2);
var vm2 = new BasicVm_1.BasicVm(su2);
vm2.ip = 0;
for (var i = 0; i < 100; i++) {
    if (vm2.hasNext()) {
        var r = vm2.next();
        console.log(i + " executed " + r);
        console.log(vm2.memo);
    }
    else {
        console.log("finish 1");
        break;
    }
}
//# sourceMappingURL=BasicVmTest.js.map