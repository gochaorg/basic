"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Parser_1 = require("../ast/Parser");
/**
 * Исходная строка
 */
class SourceLine {
    constructor(line, code) {
        this.line = line;
        this.statement = code;
    }
}
exports.SourceLine = SourceLine;
/**
 * Исходный текст
 */
class SourceUnit {
    /**
     * Конструктор
     * @param sample образец для копирования
     */
    constructor(sample) {
        /**
         * Набор строк исхдного текста
         */
        this.sourceLines = [];
        //#region lines : IDXSourceLine
        this.linesCache = null;
        if (sample) {
            for (let li in sample.sourceLines) {
                this.sourceLines[li] = sample.sourceLines[li];
            }
        }
    }
    /**
     * Возвращает список исходных строк
     */
    get lines() {
        if (this.linesCache)
            return this.linesCache;
        let lines = [];
        let idx = -1;
        for (let sl of this.sourceLines) {
            idx++;
            lines.push({ statement: sl.statement, index: idx, line: sl.line });
        }
        this.linesCache = Object.freeze(lines);
        return this.linesCache;
    }
    //#endregion
    /**
     * Возвращает исходную строку (номер, строка / индекс) по ее номеру
     * @param line номер строки
     */
    find(line) {
        if (line < 0)
            return null;
        for (let i in this.sourceLines) {
            let sline = this.sourceLines[i];
            if (sline.line == line) {
                return { statement: sline.statement, index: parseInt(i), line: sline.line };
            }
        }
        return null;
    }
    /**
     * Возвращает исходную строку (номер, строка / индекс) по ее номеру
     * @param line номер строки
     */
    line(line) {
        const res = this.find(line);
        if (res)
            return res;
        throw new Error(`source line with number ${line} not found`);
    }
    /**
     * Добавляет строку и возвращает новый объект исходного когда
     * @param line номер строки
     * @param code код
     * @returns модифицированный исходный код
     */
    set(line, code) {
        if (line < 0)
            throw new Error("argument line(=" + line + ") < 0");
        const fnd = this.find(line);
        if (fnd) {
            let cln = new SourceUnit(this);
            cln.sourceLines[fnd.index] = new SourceLine(line, code);
            return cln;
        }
        let cln = new SourceUnit(this);
        cln.sourceLines.push(new SourceLine(line, code));
        cln.sourceLines = cln.sourceLines.sort((a, b) => a.line - b.line);
        return cln;
    }
    /**
     * Парсинг исходного текста
     * @param source исходный текст
     * @param presult результат парсинга
     */
    parse(source, presult) {
        if (source) {
            const parser = Parser_1.Parser.create(source);
            const stmts = parser.statements();
            let res = this;
            if (stmts) {
                const sstmts = [];
                const istmts = [];
                if (presult && presult.statments) {
                    presult.statments(stmts);
                }
                for (let st of stmts.statements) {
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
    }
}
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