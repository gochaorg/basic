"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = require("./Statement");
class CallStatement extends Statement_1.Statement {
    constructor(begin, end, call, name, args) {
        super();
        this.kind = 'Call';
        this.begin = begin;
        this.end = end;
        this.call = call;
        this.name = name;
        this.args = args;
    }
}
exports.CallStatement = CallStatement;
//# sourceMappingURL=CallStatement.js.map