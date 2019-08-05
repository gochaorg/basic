"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = require("./Statement");
class RunStatement extends Statement_1.Statement {
    constructor(begin, end, line) {
        super();
        this.begin = begin;
        this.end = end;
        this.runLine = line;
        this.kind = 'Run';
    }
}
exports.RunStatement = RunStatement;
//# sourceMappingURL=RunStatement.js.map