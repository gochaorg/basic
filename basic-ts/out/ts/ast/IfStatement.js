"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = require("./Statement");
class IfStatement extends Statement_1.Statement {
    constructor(begin, end, boolExp, trueStatement, falseStatement) {
        super();
        this.kind = 'If';
        this.begin = begin;
        this.end = end;
        this.boolExp = boolExp;
        this.trueStatement = trueStatement;
        this.falseStatement = falseStatement;
    }
}
exports.IfStatement = IfStatement;
//# sourceMappingURL=IfStatement.js.map