"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = require("./Statement");
class RemStatement extends Statement_1.Statement {
    constructor(begin, end, rem) {
        super();
        this.kind = 'Rem';
        this.begin = begin;
        this.end = end;
        this.rem = rem;
    }
}
exports.RemStatement = RemStatement;
//# sourceMappingURL=RemStatement.js.map