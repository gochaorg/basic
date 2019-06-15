"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var LX = __importStar(require("../ts/ast/Lexer"));
console.log('===== BASIC --------=========================================');
var lexs1 = LX.parseBasicLexs('10 REM aa\n' +
    '20 LET A = 12 * 4\n\r' +
    '30 LET B = 24\r\n' +
    '99 REM finish\r\n');
var lines = LX.filter(lexs1).lines;
for (var li = 0; li < lines.length; li++) {
    console.log("line " + li);
    console.log("----------------");
    var line = lines[li];
    console.log(line);
}
//# sourceMappingURL=LexerTest2.js.map