"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Statement_1 = require("./Statement");
class PrintStatement extends Statement_1.Statement {
    constructor(begin, end, print, args) {
        super();
        this.kind = 'Print';
        this.begin = begin;
        this.end = end;
        this.print = print;
        this.args = args;
    }
}
exports.PrintStatement = PrintStatement;
//# sourceMappingURL=PrintStatement.js.map