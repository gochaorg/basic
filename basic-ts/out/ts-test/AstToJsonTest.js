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
var su1 = new su.SourceUnit;
console.log("parsing");
console.log("======================");
su1 = su1.parse('10 REM cmnt\n' +
    '20 LET b = 10*2+7\n' +
    '22 GOTO 10\n' +
    '24 LET A = B(10,2)\n' +
    '30 PRINT "Hello"\n' +
    'RUN 10', {
    immediateStatements: function (commands) {
        //console.log("== immediate commands ==")
        //commands.forEach( cmd => console.log(cmd))
    }
});
//console.log( JSON.stringify(su1.line(30).statement,undefined,2) )
console.log(JSON.stringify(su1, undefined, 2));
//# sourceMappingURL=AstToJsonTest.js.map