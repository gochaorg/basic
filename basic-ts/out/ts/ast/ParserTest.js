"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Basic = __importStar(require("./Parser"));
console.log('== Basic parser ==');
var testExpressions = [
    //{ code: '10 + 8*3', parseFn: (p)=>p.expression() },
    //{ code: '10 - 8/3', parseFn: (p)=>p.expression() },
    { code: 'A + B ^ C', parseFn: function (p) { return p.expression(); }, debug: false },
    { code: 'A IMP B', parseFn: function (p) { return p.expression(); } },
    { code: 'A EQV B OR ( C XOR D OR E AND F )', parseFn: function (p) { return p.expression(); }, json: true },
    { code: 'NOT B AND E', parseFn: function (p) { return p.expression(); } },
    { code: '2 < 3 AND 3 > 2 AND 4 = 4', parseFn: function (p) { return p.expression(); }, json: true },
    { code: '2 <= 3 AND 3 => 2 AND 4 <> 5', parseFn: function (p) { return p.expression(); }, json: true },
    { code: '2 => 3 AND 3 >= 2 AND 4 >< 5', parseFn: function (p) { return p.expression(); }, json: true },
    { code: '-1', parseFn: function (p) { return p.expression(); }, json: true },
    { code: '-1-2', parseFn: function (p) { return p.expression(); }, json: true },
];
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
//# sourceMappingURL=ParserTest.js.map