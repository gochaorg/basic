"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Lexer_1 = require("./Lexer");
/**
 * Некий кусок кода, который по традиции должен умещаться в одной строке
 */
var Statement = /** @class */ (function () {
    function Statement() {
    }
    Object.defineProperty(Statement.prototype, "sourceLine", {
        /**
         * Номер строки
         */
        get: function () {
            if (this.begin instanceof Lexer_1.SourceLineBeginLex) {
                return this.begin.line;
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    return Statement;
}());
exports.Statement = Statement;
//# sourceMappingURL=Statement.js.map