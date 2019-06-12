"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Исходная строка
 */
var SourceLine = /** @class */ (function () {
    function SourceLine(line, code) {
        this.line = line;
        this.code = code;
    }
    return SourceLine;
}());
exports.SourceLine = SourceLine;
/**
 * Исходный текст
 */
var SourceUnit = /** @class */ (function () {
    function SourceUnit(sample) {
        this.sourceLines = [];
        this.linesCache = null;
        if (sample != null) {
            for (var li in sample.sourceLines) {
                this.sourceLines[li] = sample.sourceLines[li];
            }
        }
    }
    Object.defineProperty(SourceUnit.prototype, "lines", {
        /**
         * Возвращает список исходных строк
         */
        get: function () {
            if (this.linesCache)
                return this.linesCache;
            this.linesCache = Object.freeze(this.sourceLines);
            return this.linesCache;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Возвращает исходную строку (номер, строка / индекс) по ее номеру
     * @param line номер строки
     */
    SourceUnit.prototype.find = function (line) {
        if (line < 0)
            return null;
        for (var i in this.sourceLines) {
            var sline = this.sourceLines[i];
            if (sline.line == line)
                return { sline: sline, index: parseInt(i) };
        }
        return null;
    };
    /**
     * Добавляет строку и возвращает новый объект исходного когда
     * @param line номер строки
     * @param code код
     * @returns модифицированный исходный код
     */
    SourceUnit.prototype.set = function (line, code) {
        if (line < 0)
            throw new Error("argument line(=" + line + ") < 0");
        var fnd = this.find(line);
        if (fnd) {
            var cln_1 = new SourceUnit(this);
            cln_1.sourceLines[fnd.index] = new SourceLine(line, code);
            return cln_1;
        }
        var cln = new SourceUnit(this);
        cln.sourceLines.push(new SourceLine(line, code));
        cln.sourceLines = cln.sourceLines.sort(function (a, b) { return a.line - b.line; });
        return cln;
    };
    return SourceUnit;
}());
exports.SourceUnit = SourceUnit;
//# sourceMappingURL=SourceUnit.js.map