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
var Ast = __importStar(require("../ts/ast/AstVisitor"));
console.log('== Basic parser / Ast visitor ==');
var src1 = '10 REM cmnt\n' +
    '20 LET b = a\n' +
    'RUN 10';
console.log("source:", src1);
var parser = Basic.Parser.create(src1);
var ast1 = parser.statements();
console.log("......................");
console.log("parsed ast tree:", ast1);
console.log("----------------------");
console.log("visit ast tree");
console.log("......................");
var opStack = [];
Ast.visit(ast1, {
    statements: {
        begin: function (statements) { console.log("BEGIN Statements (" + statements.statements.length + ")"); },
        end: function (statements) { console.log("END Statements (" + statements.statements.length + ")"); }
    },
    rem: {
        begin: function (v) { console.log("COMMENT " + v.rem.comment); }
    },
    let: {
        begin: function (v) {
            console.log("LET " + v.variable.id + " = ");
        }
    },
    operator: {
        binary: {
            begin: function (v) {
                console.log("BINOP " + v.operator.keyWord);
            }
        },
        unary: {
            begin: function (v) {
                console.log("UNARY " + v.operator.keyWord);
            }
        },
        literal: {
            begin: function (v) { console.log(v.value); }
        },
        varRef: {
            begin: function (v) { console.log(v.id.id); }
        }
    }
});
//# sourceMappingURL=AstVisitorTest.js.map