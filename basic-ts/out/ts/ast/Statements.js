"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = require("./Statement");
class Statements extends Statement_1.Statement {
    constructor(begin, end, statements) {
        super();
        this.kind = "Statements";
        this.begin = begin;
        this.end = end;
        this.statements = statements;
    }
}
exports.Statements = Statements;
//# sourceMappingURL=Statements.js.map