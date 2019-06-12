"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Basic = __importStar(require("../ts/ast/Parser"));
console.log('== Basic parser ==');
var testExpressions = [
    //{ code: '10 + 8*3', parseFn: (p)=>p.expression() },
    { code: '10 REM hello', parseFn: function (p) { return p.statement(); }, json: true },
    { code: '10 LET a = 1', parseFn: function (p) { return p.statement(); }, json: true },
    { code: '10 LET b = c < d', parseFn: function (p) { return p.statement(); }, json: true },
    { code: '10 REM cmnt\n' +
            '20 LET b = c < d',
        parseFn: function (p) { return p.statements(); } },
    { code: '10 REM cmnt\n' +
            '20 LET b = a\n' +
            'RUN 10',
        parseFn: function (p) { return p.statements(); },
        debug: false
    },
];
console.log("== parse statements ============");
testExpressions.forEach(function (texp) {
    console.log("\ncode:  ", texp.code);
    var parser = Basic.Parser.create(texp.code);
    if (texp.debug != undefined)
        parser.debug = texp.debug;
    var presult = texp.parseFn(parser);
    if (texp.json && presult) {
        console.log("result (json):");
        console.log(JSON.stringify(presult, null, 4));
    }
    else {
        console.log("result:", presult);
    }
});
//# sourceMappingURL=ParserTest2.js.map