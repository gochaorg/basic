"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Basic = __importStar(require("../ts/ast/Parser"));
const OperatorExp_1 = require("../ts/ast/OperatorExp");
const AstToBasic_1 = require("../ts/ast/AstToBasic");
console.log('== Basic parser ==');
let testExpressions = [
    //{ code: 'A + B ^ C', parseFn: (p)=>p.expression(), debug:false },
    //{ code: 'A IMP B', parseFn: (p)=>p.expression() },
    //{ code: 'A EQV B OR ( C XOR D OR E AND F )', parseFn: (p)=>p.expression(), json:true },
    //{ code: 'NOT B AND E', parseFn: (p)=>p.expression() },
    //{ code: '2 < 3 AND 3 > 2 AND 4 = 4', parseFn: (p)=>p.expression(), json:true },
    //{ code: '2 <= 3 AND 3 => 2 AND 4 <> 5', parseFn: (p)=>p.expression(), json:true },
    //{ code: '2 => 3 AND 3 >= 2 AND 4 >< 5', parseFn: (p)=>p.expression(), json:true },
    { code: '-1', parseFn: (p) => p.expression(), json: true },
    { code: '-1-2', parseFn: (p) => p.expression(), json: true, toBasic: true },
    { code: '10*2+7', parseFn: (p) => p.expression(), debug: true, json: false, toBasic: true },
    { code: '2+7+3', parseFn: (p) => p.expression(), debug: false, json: false, toBasic: true },
    { code: '2*7*3', parseFn: (p) => p.expression(), debug: false, json: false, toBasic: true },
];
testExpressions.forEach(texp => {
    console.log("\ncode:  ", texp.code);
    let parser = Basic.Parser.create(texp.code);
    if (texp.debug != undefined)
        parser.debug = texp.debug;
    let presult = texp.parseFn(parser);
    if (texp.toBasic) {
        if (presult instanceof OperatorExp_1.BinaryOpExpression
            || presult instanceof OperatorExp_1.UnaryOpExpression) {
            console.log("toBasic: ", AstToBasic_1.astToBasic(presult));
        }
    }
    if (texp.json && presult) {
        console.log("result (json):");
        console.log(JSON.stringify(presult, null, 4));
    }
    else {
        console.log("result:", presult);
    }
});
//# sourceMappingURL=ParserTest.js.map