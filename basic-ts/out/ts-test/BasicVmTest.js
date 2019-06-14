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
var vm = new BasicVm_1.BasicVm(su1);
vm.evalStatement(su1.line(20).statement);
console.log("-- memo -----------------");
console.log(vm.memo.values);
//# sourceMappingURL=BasicVmTest.js.map