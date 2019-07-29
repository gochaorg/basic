"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OperatorExp_1 = require("./OperatorExp");
var LetStatement_1 = require("./LetStatement");
var RemStatement_1 = require("./RemStatement");
var RunStatement_1 = require("./RunStatement");
var Statements_1 = require("./Statements");
var SourceUnit_1 = require("../vm/SourceUnit");
var GotoStatement_1 = require("./GotoStatement");
var IfStatement_1 = require("./IfStatement");
var GoSubStatement_1 = require("./GoSubStatement");
var ReturnStatement_1 = require("./ReturnStatement");
var PrintStatement_1 = require("./PrintStatement");
var CallStatement_1 = require("./CallStatement");
/**
 * Генератор из AST в BASIC
 */
function astToBasic(root, opts) {
    if (opts == undefined) {
        opts = {
            sourceLineNumber: true
        };
    }
    if (root == undefined)
        return "";
    if (root == null)
        return "";
    //#region LiteralExpression
    if (root instanceof OperatorExp_1.LiteralExpression) {
        if (typeof (root.value) == 'number') {
            return '' + root.value;
        }
        else if (typeof (root.value) == 'boolean') {
            if (root.value) {
                return '1<2';
            }
            else {
                return '1>2';
            }
        }
        else if (typeof (root.value) == 'string') {
            var sval = root.value;
            var str = "\"";
            for (var i = 0; i < sval.length; i++) {
                var ch = sval[i];
                if (ch == '"') {
                    str += "{encode_dquote}";
                }
                else if (ch == "'") {
                    str += "{encode_quote}";
                }
                else if (ch == "\n") {
                    str += "{encode_nl}";
                }
                else if (ch == "\r") {
                    str += "{encode_cr}";
                }
                else if (ch == "\t") {
                    str += "{encode_tab}";
                }
                else if (ch.charCodeAt(0) > 31) {
                    str += ch;
                }
            }
            str += "\"";
            return str;
        }
        else {
            throw new Error("unknow Literal value type = " + typeof (root.value));
        }
    }
    //#endregion
    //#region var ref
    if (root instanceof OperatorExp_1.VarArrIndexRef) {
        var code = '';
        code += root.varname;
        code += '(';
        var idx = -1;
        for (var _i = 0, _a = root.indexes; _i < _a.length; _i++) {
            var aidx = _a[_i];
            idx++;
            if (idx > 0)
                code += ',';
            code += astToBasic(aidx, opts);
        }
        code += ')';
        return code;
    }
    //#endregion
    //#region var ref
    if (root instanceof OperatorExp_1.VarRefExpression) {
        return root.varname;
    }
    //#endregion
    //#region unary ref
    if (root instanceof OperatorExp_1.UnaryOpExpression) {
        return root.operator.keyWord + '(' + astToBasic(root.base, opts) + ')';
    }
    //#endregion
    //#region BinaryOpExpression
    if (root instanceof OperatorExp_1.BinaryOpExpression) {
        var code = '';
        if (root.left.treeSize > 1) {
            code += '(' + astToBasic(root.left, opts) + ')';
        }
        else {
            code += astToBasic(root.left, opts);
        }
        code += root.operator.keyWord;
        if (root.right.treeSize > 1) {
            code += '(' + astToBasic(root.right, opts) + ')';
        }
        else {
            code += astToBasic(root.right, opts);
        }
        return code;
    }
    //#endregion
    //#region LET
    if (root instanceof LetStatement_1.LetStatement) {
        var code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = root.sourceLine + " ";
        }
        code += "LET " + root.varname + " = " + astToBasic(root.value, opts);
        return code;
    }
    //#endregion
    //#region REM
    if (root instanceof RemStatement_1.RemStatement) {
        var code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = root.sourceLine + " ";
        }
        code += "REM " + root.rem.comment;
        return code;
    }
    //#endregion
    //#region RUN
    if (root instanceof RunStatement_1.RunStatement) {
        var code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = root.sourceLine + " ";
        }
        code += "RUN";
        if (root.runLine != undefined) {
            code += " " + root.runLine;
        }
        return code;
    }
    //#endregion
    //#region GOTO
    if (root instanceof GotoStatement_1.GotoStatement) {
        var code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = root.sourceLine + " ";
        }
        code += "GOTO";
        if (root.gotoLine != undefined) {
            code += " " + root.gotoLine.value;
        }
        return code;
    }
    //#endregion
    //#region GOSUB
    if (root instanceof GoSubStatement_1.GoSubStatement) {
        var code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = root.sourceLine + " ";
        }
        code += "GOSUB";
        if (root.gotoLine != undefined) {
            code += " " + root.gotoLine.value;
        }
        return code;
    }
    //#endregion
    //#region RETURN
    if (root instanceof ReturnStatement_1.ReturnStatement) {
        var code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = root.sourceLine + " ";
        }
        code += "RETURN";
        if (root.gotoLine != undefined) {
            code += " " + root.gotoLine.value;
        }
        return code;
    }
    //#endregion
    //#region IF
    if (root instanceof IfStatement_1.IfStatement) {
        var code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = root.sourceLine + " ";
        }
        code += "IF ";
        code += astToBasic(root.boolExp, opts);
        code += " THEN ";
        code += astToBasic(root.trueStatement, { sourceLineNumber: false });
        if (root.falseStatement) {
            code += " ELSE ";
            code += astToBasic(root.falseStatement, { sourceLineNumber: false });
        }
        return code;
    }
    //#endregion
    //#region PrintStatement
    if (root instanceof PrintStatement_1.PrintStatement) {
        var code_1 = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code_1 = root.sourceLine + " ";
        }
        code_1 += "PRINT";
        if (root.args.length > 0)
            code_1 += " ";
        var argi_1 = -1;
        root.args.forEach(function (arg) {
            argi_1++;
            if (argi_1 > 0) {
                code_1 += ",";
            }
            code_1 += astToBasic(arg, opts);
        });
        return code_1;
    }
    //#endregion
    //#region CallStatement
    if (root instanceof CallStatement_1.CallStatement) {
        var code_2 = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code_2 = root.sourceLine + " ";
        }
        code_2 += "CALL ";
        code_2 += root.name.id;
        if (root.args.length > 0)
            code_2 += " ";
        var argi_2 = -1;
        root.args.forEach(function (arg) {
            argi_2++;
            if (argi_2 > 0) {
                code_2 += ",";
            }
            code_2 += astToBasic(arg, opts);
        });
        return code_2;
    }
    //#endregion
    //#region Statements
    if (root instanceof Statements_1.Statements) {
        var code_3 = '';
        root.statements.forEach(function (st) {
            if (code_3.length > 0) {
                code_3 += "\n";
            }
            code_3 += astToBasic(st, opts);
        });
        return code_3;
    }
    //#endregion
    //#region SourceUnit
    if (root instanceof SourceUnit_1.SourceUnit) {
        var code_4 = '';
        root.lines.forEach(function (line) {
            if (code_4.length > 0) {
                code_4 += "\n";
            }
            code_4 += astToBasic(line.statement, opts);
        });
        return code_4;
    }
    //#endregion
    throw new Error("unknow argument type " + root + ":" + Object.getPrototypeOf(root));
}
exports.astToBasic = astToBasic;
//# sourceMappingURL=AstToBasic.js.map