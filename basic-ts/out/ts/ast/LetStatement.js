"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = require("./Statement");
class LetStatement extends Statement_1.Statement {
    constructor(begin, end, variable, value) {
        super();
        this.kind = 'Let';
        this.begin = begin;
        this.end = end;
        this.variable = variable;
        this.value = value;
    }
    get varname() { return this.variable.id; }
}
exports.LetStatement = LetStatement;
//# sourceMappingURL=LetStatement.js.map