"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lexer_1 = require("./Lexer");
/**
 * Некий кусок кода, который по традиции должен умещаться в одной строке
 */
class Statement {
    /**
     * Номер строки
     */
    get sourceLine() {
        if (this.begin instanceof Lexer_1.SourceLineBeginLex) {
            return this.begin.line;
        }
        return undefined;
    }
}
exports.Statement = Statement;
//# sourceMappingURL=Statement.js.map