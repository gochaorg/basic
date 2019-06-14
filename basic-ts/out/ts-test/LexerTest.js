"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Ast = __importStar(require("../ts/ast/Lexer"));
var lexs = Ast.lexems(' RUN REM LIST', [Ast.WhiteSpaceLex.parse,
    Ast.KeyWordLex.parser(true, ['RUN', 'REM', 'LIST'])
]);
console.log(lexs);
console.log('===== REM =================================================');
console.log(Ast.lexems(' REM LIST comment\n LIST  REM 1234', [
    Ast.WhiteSpaceLex.parse,
    Ast.RemLex.parse,
    Ast.KeyWordLex.parser(true, ['RUN', 'REM', 'LIST'])
]));
console.log('===== NUMS =================================================');
console.log(Ast.lexems(' 12 014 0 &HFF &o010 +14 -23 +15.67 34.23 10.34e+1', [
    Ast.WhiteSpaceLex.parse,
    Ast.NumberLex.parse
]));
console.log('===== String =================================================');
console.log(Ast.lexems(' "str 1" "str2" ', [
    Ast.WhiteSpaceLex.parse,
    Ast.StringLex.parse
]));
console.log('===== Key Words =================================================');
console.log(Ast.lexems(' aa abc ab a ab abc ', [
    Ast.WhiteSpaceLex.parse,
    Ast.KeyWordLex.parser(true, ['a', 'ab', 'abc', 'c', 'b', 'aa', 'ac'])
]));
console.log('===== ID =================================================');
console.log(Ast.lexems('A B1 B$', [Ast.WhiteSpaceLex.parse, Ast.IDLex.parse]));
console.log('===== BASIC =================================================');
console.log(Ast.lexems('10 REM aa\n20 LET A = 12', Ast.basicLexems));
//# sourceMappingURL=LexerTest.js.map