"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = require("./Statement");
class ReturnStatement extends Statement_1.Statement {
    constructor(begin, end, line) {
        super();
        this.kind = 'Return';
        this.begin = begin;
        this.end = end;
        this.gotoLine = line;
    }
}
exports.ReturnStatement = ReturnStatement;
//# sourceMappingURL=ReturnStatement.js.map