"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Parser_1 = require("../ast/Parser");
/**
 * Исходная строка
 */
var SourceLine = /** @class */ (function () {
    function SourceLine(line, code) {
        this.line = line;
        this.statement = code;
    }
    return SourceLine;
}());
exports.SourceLine = SourceLine;
/**
 * Исходный текст
 */
var SourceUnit = /** @class */ (function () {
    /**
     * Конструктор
     * @param sample образец для копирования
     */
    function SourceUnit(sample) {
        /**
         * Набор строк исхдного текста
         */
        this.sourceLines = [];
        //#region lines : SourceLine
        this.linesCache = null;
        if (sample) {
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
    //#endregion
    /**
     * Возвращает исходную строку (номер, строка / индекс) по ее номеру
     * @param line номер строки
     */
    SourceUnit.prototype.find = function (line) {
        if (line < 0)
            return null;
        for (var i in this.sourceLines) {
            var sline = this.sourceLines[i];
            if (sline.line == line) {
                return { statement: sline.statement, index: parseInt(i), line: sline.line };
            }
        }
        return null;
    };
    /**
     * Возвращает исходную строку (номер, строка / индекс) по ее номеру
     * @param line номер строки
     */
    SourceUnit.prototype.line = function (line) {
        var res = this.find(line);
        if (res)
            return res;
        throw new Error("source line with number " + line + " not found");
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
    /**
     * Парсинг исходного текста
     * @param source исходный текст
     * @param presult результат парсинга
     */
    SourceUnit.prototype.parse = function (source, presult) {
        if (source) {
            var parser = Parser_1.Parser.create(source);
            var stmts = parser.statements();
            var res = this;
            if (stmts) {
                var sstmts = [];
                var istmts = [];
                if (presult && presult.statments) {
                    presult.statments(stmts);
                }
                for (var _i = 0, _a = stmts.statements; _i < _a.length; _i++) {
                    var st = _a[_i];
                    if (st.sourceLine) {
                        res = res.set(st.sourceLine, st);
                        sstmts.push(st);
                    }
                    else {
                        istmts.push(st);
                    }
                }
                if (presult && presult.sources) {
                    presult.sources(sstmts);
                }
                if (presult && presult.immediateStatements) {
                    presult.immediateStatements(istmts);
                }
            }
            return res;
        }
        return this;
    };
    return SourceUnit;
}());
exports.SourceUnit = SourceUnit;
/**
 * Парсинг исходника
 * @param source исходник
 */
function parse(source) {
    return new SourceUnit().parse(source);
}
exports.parse = parse;
//# sourceMappingURL=SourceUnit.js.map