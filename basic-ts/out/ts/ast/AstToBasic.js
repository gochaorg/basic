"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OperatorExp_1 = require("./OperatorExp");
const LetStatement_1 = require("./LetStatement");
const RemStatement_1 = require("./RemStatement");
const RunStatement_1 = require("./RunStatement");
const Statements_1 = require("./Statements");
const SourceUnit_1 = require("../vm/SourceUnit");
const GotoStatement_1 = require("./GotoStatement");
const IfStatement_1 = require("./IfStatement");
const GoSubStatement_1 = require("./GoSubStatement");
const ReturnStatement_1 = require("./ReturnStatement");
const PrintStatement_1 = require("./PrintStatement");
const CallStatement_1 = require("./CallStatement");
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
            const sval = root.value;
            let str = "\"";
            for (let i = 0; i < sval.length; i++) {
                let ch = sval[i];
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
            throw new Error(`unknow Literal value type = ${typeof (root.value)}`);
        }
    }
    //#endregion
    //#region var ref
    if (root instanceof OperatorExp_1.VarArrIndexRef) {
        let code = '';
        code += root.varname;
        code += '(';
        let idx = -1;
        for (let aidx of root.indexes) {
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
        let code = '';
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
        let code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = `${root.sourceLine} `;
        }
        code += `LET ${root.varname} = ${astToBasic(root.value, opts)}`;
        return code;
    }
    //#endregion
    //#region REM
    if (root instanceof RemStatement_1.RemStatement) {
        let code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = `${root.sourceLine} `;
        }
        code += `REM ${root.rem.comment}`;
        return code;
    }
    //#endregion
    //#region RUN
    if (root instanceof RunStatement_1.RunStatement) {
        let code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = `${root.sourceLine} `;
        }
        code += "RUN";
        if (root.runLine != undefined) {
            code += ` ${root.runLine}`;
        }
        return code;
    }
    //#endregion
    //#region GOTO
    if (root instanceof GotoStatement_1.GotoStatement) {
        let code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = `${root.sourceLine} `;
        }
        code += "GOTO";
        if (root.gotoLine != undefined) {
            code += ` ${root.gotoLine.value}`;
        }
        return code;
    }
    //#endregion
    //#region GOSUB
    if (root instanceof GoSubStatement_1.GoSubStatement) {
        let code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = `${root.sourceLine} `;
        }
        code += "GOSUB";
        if (root.gotoLine != undefined) {
            code += ` ${root.gotoLine.value}`;
        }
        return code;
    }
    //#endregion
    //#region RETURN
    if (root instanceof ReturnStatement_1.ReturnStatement) {
        let code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = `${root.sourceLine} `;
        }
        code += "RETURN";
        if (root.gotoLine != undefined) {
            code += ` ${root.gotoLine.value}`;
        }
        return code;
    }
    //#endregion
    //#region IF
    if (root instanceof IfStatement_1.IfStatement) {
        let code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = `${root.sourceLine} `;
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
        let code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = `${root.sourceLine} `;
        }
        code += "PRINT";
        if (root.args.length > 0)
            code += " ";
        let argi = -1;
        root.args.forEach(arg => {
            argi++;
            if (argi > 0) {
                code += ",";
            }
            code += astToBasic(arg, opts);
        });
        return code;
    }
    //#endregion
    //#region CallStatement
    if (root instanceof CallStatement_1.CallStatement) {
        let code = '';
        if (root.sourceLine != undefined && opts.sourceLineNumber) {
            code = `${root.sourceLine} `;
        }
        code += "CALL ";
        code += root.name.id;
        if (root.args.length > 0)
            code += " ";
        let argi = -1;
        root.args.forEach(arg => {
            argi++;
            if (argi > 0) {
                code += ",";
            }
            code += astToBasic(arg, opts);
        });
        return code;
    }
    //#endregion
    //#region Statements
    if (root instanceof Statements_1.Statements) {
        let code = '';
        root.statements.forEach(st => {
            if (code.length > 0) {
                code += "\n";
            }
            code += astToBasic(st, opts);
        });
        return code;
    }
    //#endregion
    //#region SourceUnit
    if (root instanceof SourceUnit_1.SourceUnit) {
        let code = '';
        root.lines.forEach(line => {
            if (code.length > 0) {
                code += "\n";
            }
            code += astToBasic(line.statement, opts);
        });
        return code;
    }
    //#endregion
    throw new Error("unknow argument type " + root + ":" + Object.getPrototypeOf(root));
}
exports.astToBasic = astToBasic;
//# sourceMappingURL=AstToBasic.js.map