"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const su = __importStar(require("../../ts/vm/SourceUnit"));
const BasicVm_1 = require("../../ts/vm/BasicVm");
const ExtFun_1 = require("../../ts/vm/ExtFun");
const AstToBasic_1 = require("../../ts/ast/AstToBasic");
console.log('== call test ==');
const src1 = '10 CALL LIST\n' +
    '12 CALL DUMP\n' +
    '20 PRINT SUMM(1,2)';
console.log("source:", src1);
const su1 = su.parse(src1);
console.log("parsed:", su1);
const vm1 = new BasicVm_1.BasicVm(su1);
const fnTEST1 = new ExtFun_1.Fun0(ctx => {
    console.log("list of source");
    let src = "";
    ctx.source.lines.forEach(sl => {
        src += AstToBasic_1.astToBasic(sl.statement) + "\n";
    });
    console.log(src);
});
vm1.memo.write('LIST', fnTEST1);
vm1.memo.write('DUMP', new ExtFun_1.Fun0(ctx => {
    console.log("dump");
    console.log(ctx.vm.memo);
}));
vm1.memo.write('SUMM', new ExtFun_1.Fun2((ctx, a, b) => {
    //console.log("call summ1",a,b)
    if (typeof (a) == 'number' && typeof (b) == 'number')
        return a + b;
    if (typeof (a) == 'number' && typeof (b) == 'string')
        return a + b;
    if (typeof (a) == 'string' && typeof (b) == 'string')
        return a + b;
    if (typeof (a) == 'string' && typeof (b) == 'number')
        return a + b;
    return undefined;
}));
console.log("run");
vm1.ip = 0;
while (vm1.hasNext()) {
    vm1.next();
}
//# sourceMappingURL=CallTest.js.map