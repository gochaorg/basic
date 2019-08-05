"use strict";
/**
 * Обход Ast дерева
 */
Object.defineProperty(exports, "__esModule", { value: true });
const RemStatement_1 = require("./RemStatement");
const Statements_1 = require("./Statements");
const LetStatement_1 = require("./LetStatement");
const RunStatement_1 = require("./RunStatement");
const OperatorExp_1 = require("./OperatorExp");
const TreeIt_1 = require("../common/TreeIt");
const GotoStatement_1 = require("./GotoStatement");
const ReturnStatement_1 = require("./ReturnStatement");
const GoSubStatement_1 = require("./GoSubStatement");
const PrintStatement_1 = require("./PrintStatement");
const CallStatement_1 = require("./CallStatement");
/**
Шаг при обходе дерева
*/
class AstTreeStep extends TreeIt_1.TreeStep {
}
exports.AstTreeStep = AstTreeStep;
function walk(ts, visitor) {
    //#region check args
    if (visitor == undefined || visitor == null) {
        throw new Error("illegal argument visitor");
    }
    if (ts == undefined || ts == null) {
        throw new Error("illegal argument path");
    }
    //#endregion
    //#region Statements
    if (ts.value instanceof Statements_1.Statements) {
        if (visitor.statements && visitor.statements.begin) {
            visitor.statements.begin(ts.value, ts);
        }
        for (let st of ts.value.statements) {
            walk(ts.follow(st), visitor);
        }
        if (visitor.statements && visitor.statements.end) {
            visitor.statements.end(ts.value, ts);
        }
    }
    //#endregion
    //#region RemStatement
    if (ts.value instanceof RemStatement_1.RemStatement) {
        if (visitor.rem && visitor.rem.begin) {
            visitor.rem.begin(ts.value, ts);
        }
        if (visitor.rem && visitor.rem.end) {
            visitor.rem.end(ts.value, ts);
        }
    }
    //#endregion
    //#region LetStatement
    if (ts.value instanceof LetStatement_1.LetStatement) {
        if (visitor.let && visitor.let.begin) {
            visitor.let.begin(ts.value, ts);
        }
        walk(ts.follow(ts.value.value), visitor);
        if (visitor.let && visitor.let.end) {
            visitor.let.end(ts.value, ts);
        }
    }
    //#endregion
    //#region PrintStatement
    if (ts.value instanceof PrintStatement_1.PrintStatement) {
        if (visitor.print && visitor.print.begin) {
            visitor.print.begin(ts.value, ts);
        }
        ts.value.args.forEach((e) => {
            walk(ts.follow(e), visitor);
        });
        if (visitor.print && visitor.print.end) {
            visitor.print.end(ts.value, ts);
        }
    }
    //#endregion
    //#region CallStatement
    if (ts.value instanceof CallStatement_1.CallStatement) {
        if (visitor.call && visitor.call.begin) {
            visitor.call.begin(ts.value, ts);
        }
        ts.value.args.forEach((e) => {
            walk(ts.follow(e), visitor);
        });
        if (visitor.call && visitor.call.end) {
            visitor.call.end(ts.value, ts);
        }
    }
    //#endregion
    //#region RunStatement
    if (ts.value instanceof RunStatement_1.RunStatement) {
        if (visitor.run && visitor.run.begin) {
            visitor.run.begin(ts.value, ts);
        }
        if (visitor.run && visitor.run.end) {
            visitor.run.end(ts.value, ts);
        }
    }
    //#endregion
    //#region GotoStatement
    if (ts.value instanceof GotoStatement_1.GotoStatement) {
        if (visitor.goto && visitor.goto.begin) {
            visitor.goto.begin(ts.value, ts);
        }
        if (visitor.goto && visitor.goto.end) {
            visitor.goto.end(ts.value, ts);
        }
    }
    //#endregion
    //#region GosubStatement
    if (ts.value instanceof GoSubStatement_1.GoSubStatement) {
        if (visitor.gosub && visitor.gosub.begin) {
            visitor.gosub.begin(ts.value, ts);
        }
        if (visitor.gosub && visitor.gosub.end) {
            visitor.gosub.end(ts.value, ts);
        }
    }
    //#endregion
    //#region GosubStatement
    if (ts.value instanceof ReturnStatement_1.ReturnStatement) {
        if (visitor.return && visitor.return.begin) {
            visitor.return.begin(ts.value, ts);
        }
        if (visitor.return && visitor.return.end) {
            visitor.return.end(ts.value, ts);
        }
    }
    //#endregion
    //#region BinaryOpExpression
    if (ts.value instanceof OperatorExp_1.BinaryOpExpression) {
        if (visitor.operator && visitor.operator.binary && visitor.operator.binary.begin) {
            visitor.operator.binary.begin(ts.value, ts);
        }
        if (ts.value.left) {
            walk(ts.follow(ts.value.left), visitor);
        }
        if (ts.value.right) {
            walk(ts.follow(ts.value.right), visitor);
        }
        if (visitor.operator && visitor.operator.binary && visitor.operator.binary.end) {
            visitor.operator.binary.end(ts.value, ts);
        }
    }
    //#endregion
    //#region UnaryOpExpression
    if (ts.value instanceof OperatorExp_1.UnaryOpExpression) {
        if (visitor.operator && visitor.operator.unary && visitor.operator.unary.begin) {
            visitor.operator.unary.begin(ts.value, ts);
        }
        if (ts.value.base) {
            walk(ts.follow(ts.value.base), visitor);
        }
        if (visitor.operator && visitor.operator.unary && visitor.operator.unary.end) {
            visitor.operator.unary.end(ts.value, ts);
        }
    }
    //#endregion
    //#region LiteralExpression
    if (ts.value instanceof OperatorExp_1.LiteralExpression) {
        if (visitor.operator && visitor.operator.literal && visitor.operator.literal.begin) {
            visitor.operator.literal.begin(ts.value, ts);
        }
        if (visitor.operator && visitor.operator.literal && visitor.operator.literal.end) {
            visitor.operator.literal.end(ts.value, ts);
        }
    }
    //#endregion
    //#region VarRefExpression
    if (ts.value instanceof OperatorExp_1.VarRefExpression) {
        if (visitor.operator && visitor.operator.varRef && visitor.operator.varRef.begin) {
            visitor.operator.varRef.begin(ts.value, ts);
        }
        if (visitor.operator && visitor.operator.varRef && visitor.operator.varRef.end) {
            visitor.operator.varRef.end(ts.value, ts);
        }
    }
    //#endregion
}
exports.walk = walk;
function visit(root, visitor) {
    if (visitor == undefined || visitor == null) {
        throw new Error("illegal argument visitor");
    }
    walk(new TreeIt_1.TreeStep(root), visitor);
}
exports.visit = visit;
//# sourceMappingURL=AstVisitor.js.map