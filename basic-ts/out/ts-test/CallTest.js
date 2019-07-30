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
var ExtFun_1 = require("../ts/vm/ExtFun");
var AstToBasic_1 = require("../ts/ast/AstToBasic");
console.log('== call test ==');
var src1 = '10 CALL LIST\n' +
    '12 CALL DUMP';
console.log("source:", src1);
var su1 = su.parse(src1);
console.log("parsed:", su1);
var vm1 = new BasicVm_1.BasicVm(su1);
var fnTEST1 = new ExtFun_1.ExtFun0(function (ctx) {
    console.log("list of source");
    var src = "";
    ctx.source.lines.forEach(function (sl) {
        src += AstToBasic_1.astToBasic(sl.statement) + "\n";
    });
    console.log(src);
});
vm1.memo.write('LIST', fnTEST1);
vm1.memo.write('DUMP', new ExtFun_1.ExtFun0(function (ctx) {
    console.log("dump");
    console.log(ctx.vm.memo);
}));
console.log("run");
vm1.ip = 0;
while (vm1.hasNext()) {
    vm1.next();
}
//# sourceMappingURL=CallTest.js.map