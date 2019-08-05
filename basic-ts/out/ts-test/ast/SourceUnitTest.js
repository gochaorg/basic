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
let su1 = new su.SourceUnit;
//su1 = su1.set( 10, 'Line 1' ).set( 5, 'line0' ).set( 15, 'line15' ).set( 12, 'line12' )
//console.log( su1.lines )
//console.log( 'find', su1.find(10) )
console.log("parsing");
console.log("======================");
su1 = su1.parse('10 REM cmnt\n' +
    '20 LET b = a\n' +
    'RUN 10', {
    immediateStatements(commands) {
        console.log("== immediate commands ==");
        commands.forEach(cmd => console.log(cmd));
    }
});
console.log("== parsed ====================");
console.log(su1.lines);
//# sourceMappingURL=SourceUnitTest.js.map