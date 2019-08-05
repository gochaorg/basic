"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = require("./Statement");
class GotoStatement extends Statement_1.Statement {
    constructor(begin, end, line) {
        super();
        this.kind = 'Goto';
        this.begin = begin;
        this.end = end;
        this.gotoLine = line;
    }
}
exports.GotoStatement = GotoStatement;
//# sourceMappingURL=GotoStatement.js.map