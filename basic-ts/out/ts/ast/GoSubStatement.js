"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = require("./Statement");
class GoSubStatement extends Statement_1.Statement {
    constructor(begin, end, line) {
        super();
        this.kind = 'Gosub';
        this.begin = begin;
        this.end = end;
        this.gotoLine = line;
    }
}
exports.GoSubStatement = GoSubStatement;
//# sourceMappingURL=GoSubStatement.js.map