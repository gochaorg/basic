"use strict";
/**
 * Работа с лексемами BASIC
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Абстрактная поддержка лексем
 */
class AbstractLex {
    constructor(begin, end) {
        if (begin !== undefined) {
            this.begin = begin;
        }
        else {
            this.begin = 0;
        }
        if (end !== undefined) {
            this.end = end;
        }
        else {
            this.end = 0;
        }
    }
}
exports.AbstractLex = AbstractLex;
/**
 * Получение списка лексем из текста
 * @param text текст
 * @param lexs парсеры лексем
 */
function lexems(text, lexs) {
    let res = [];
    let off = 0;
    while (true) {
        if (off >= text.length)
            break;
        let lx = null;
        for (let lxParse of lexs) {
            if (lx != null)
                break;
            lx = lxParse(text, off);
            if (lx != null) {
                if (lx.end <= off)
                    throw new Error("fail lexem parse, end(=" + lx.end + ") < off(=" + off + ")");
                res.push(lx);
                off = lx.end;
                break;
            }
        }
        if (lx == null)
            throw new Error("can't parse " + text.substring(off, off + 50));
    }
    return res;
}
exports.lexems = lexems;
/**
 * Поддержка разных классов символов
 */
class Chars {
    static isWS(str) {
        if (str == ' ')
            return true;
        if (str == '\n')
            return true;
        if (str == '\r')
            return true;
        if (str == '\t')
            return true;
        return false;
    }
    static isNewline(str) {
        if (str == '\n')
            return true;
        if (str == '\r')
            return true;
        if (str == '\n\r')
            return true;
        if (str == '\r\n')
            return true;
        return false;
    }
    static isHexDigit(str) {
        if (str == '0' || str == '1' || str == '2' || str == '3' || str == '4')
            return true;
        if (str == '5' || str == '6' || str == '7' || str == '8' || str == '9')
            return true;
        if (str == 'A' || str == 'B' || str == 'C')
            return true;
        if (str == 'D' || str == 'E' || str == 'F')
            return true;
        if (str == 'a' || str == 'b' || str == 'c')
            return true;
        if (str == 'd' || str == 'e' || str == 'f')
            return true;
        return false;
    }
    static hexDigit(str) {
        if (!Chars.isHexDigit(str))
            throw new Error("not a digit");
        if (str == '0')
            return 0;
        if (str == '1')
            return 1;
        if (str == '2')
            return 2;
        if (str == '3')
            return 3;
        if (str == '4')
            return 4;
        if (str == '5')
            return 5;
        if (str == '6')
            return 6;
        if (str == '7')
            return 7;
        if (str == '8')
            return 8;
        if (str == '9')
            return 9;
        if (str == 'a' || str == 'A')
            return 10;
        if (str == 'b' || str == 'B')
            return 11;
        if (str == 'c' || str == 'C')
            return 12;
        if (str == 'd' || str == 'D')
            return 13;
        if (str == 'e' || str == 'E')
            return 14;
        if (str == 'f' || str == 'F')
            return 15;
        throw new Error("not a digit");
    }
    static isDecDigit(str) {
        if (str == '0' || str == '1' || str == '2' || str == '3' || str == '4')
            return true;
        if (str == '5' || str == '6' || str == '7' || str == '8' || str == '9')
            return true;
        return false;
    }
    static decDigit(str) {
        if (!Chars.isDecDigit(str))
            throw new Error("not a digit");
        if (str == '0')
            return 0;
        if (str == '1')
            return 1;
        if (str == '2')
            return 2;
        if (str == '3')
            return 3;
        if (str == '4')
            return 4;
        if (str == '5')
            return 5;
        if (str == '6')
            return 6;
        if (str == '7')
            return 7;
        if (str == '8')
            return 8;
        if (str == '9')
            return 9;
        throw new Error("not a digit");
    }
    static isOctDigit(str) {
        if (str == '0' || str == '1' || str == '2' || str == '3' || str == '4')
            return true;
        if (str == '5' || str == '6' || str == '7')
            return true;
        return false;
    }
    static octDigit(str) {
        if (!Chars.isOctDigit(str))
            throw new Error("not a digit");
        if (str == '0')
            return 0;
        if (str == '1')
            return 1;
        if (str == '2')
            return 2;
        if (str == '3')
            return 3;
        if (str == '4')
            return 4;
        if (str == '5')
            return 5;
        if (str == '6')
            return 6;
        if (str == '7')
            return 7;
        throw new Error("not a digit");
    }
}
exports.Chars = Chars;
/**
 * Лексема пробельного текста
 */
class WhiteSpaceLex extends AbstractLex {
    constructor(begin, end) {
        super(begin, end);
        this.kind = 'WhiteSpaceLex';
    }
    static parse(str, off) {
        if (off >= str.length)
            return null;
        if (!Chars.isWS(str.substr(off, 1)))
            return null;
        let from = off;
        while (true) {
            if (off >= str.length)
                break;
            if (!Chars.isWS(str.substr(off, 1)))
                break;
            off++;
        }
        let to = off;
        return new WhiteSpaceLex(from, to);
    }
}
exports.WhiteSpaceLex = WhiteSpaceLex;
/**
 * Лексема ключевых слов
 */
class KeyWordLex extends AbstractLex {
    constructor(keyWord, begin, end) {
        super(begin, end);
        this.keyWord = keyWord;
    }
    // static defaultKeyWordBuilder : (kw:string, kwBegin:number, kwEnd:number)=>Lex = (kw,kwBegin,kwEnd) => {
    //     return new KeyWordLex(kw, kwBegin, kwEnd)
    // }
    static parser(ignorecase, keyWords, keyWordBuilder) {
        keyWords = keyWords.sort((a, b) => 0 - (a.length - b.length));
        return (str, off) => {
            if (off >= str.length)
                return null;
            for (let kw of keyWords) {
                let ss = str.substring(off, off + kw.length);
                if ((ignorecase && ss.toUpperCase() == kw.toUpperCase()) ||
                    (!ignorecase && ss == kw)) {
                    //return new KeyWordLex(ss,off,off+ss.length)
                    if (keyWordBuilder) {
                        return keyWordBuilder(ss, off, off + ss.length);
                    }
                    else {
                        return new ParsedKeyWordLex(ss, off, off + ss.length);
                    }
                }
            }
            return null;
        };
    }
}
exports.KeyWordLex = KeyWordLex;
class ParsedKeyWordLex extends KeyWordLex {
    constructor() {
        super(...arguments);
        this.kind = "ParsedKeyWordLex";
    }
}
exports.ParsedKeyWordLex = ParsedKeyWordLex;
/**
 * Лексема начала новой строки
 */
class NewLineLex extends KeyWordLex {
    constructor(keyWord, begin, end) {
        super(keyWord, begin, end);
        this.kind = 'NewLineSeparator';
    }
}
NewLineLex.parse = KeyWordLex.parser(false, ['\n\r', '\r\n', '\n', '\r'], (kw, begin, end) => { return new NewLineLex(kw, begin, end); });
exports.NewLineLex = NewLineLex;
/**
 * Лексема встроенного оператора
 */
class OperatorLex extends KeyWordLex {
    constructor(keyWord, begin, end) {
        super(keyWord, begin, end);
        this.kind = 'OperatorLex';
    }
    get pow() { return this.keyWord != null && this.keyWord == '^'; }
    get mult() { return this.keyWord != null && this.keyWord == '*'; }
    get div() { return this.keyWord != null && this.keyWord == '/'; }
    get idiv() { return this.keyWord != null && this.keyWord == '\\'; }
    get mod() { return this.keyWord != null && this.keyWord.toUpperCase() == 'MOD'; }
    get plus() { return this.keyWord != null && this.keyWord == '+'; }
    get minus() { return this.keyWord != null && this.keyWord == '-'; }
    get equals() { return this.keyWord != null && this.keyWord == '='; }
    get notEquals() { return this.keyWord != null && (this.keyWord == '<>' || this.keyWord == '><'); }
    get less() { return this.keyWord != null && this.keyWord == '<'; }
    get lesOrEquals() { return this.keyWord != null && (this.keyWord == '<=' || this.keyWord == '=<'); }
    get more() { return this.keyWord != null && this.keyWord == '>'; }
    get moreOrEquals() { return this.keyWord != null && (this.keyWord == '>=' || this.keyWord == '=>'); }
    get ordReleation() { return this.more || this.moreOrEquals || this.equals || this.notEquals || this.lesOrEquals || this.less; }
    get not() { return this.keyWord != null && this.keyWord.toUpperCase() == 'NOT'; }
    get and() { return this.keyWord != null && this.keyWord.toUpperCase() == 'AND'; }
    get or() { return this.keyWord != null && this.keyWord.toUpperCase() == 'OR'; }
    get xor() { return this.keyWord != null && this.keyWord.toUpperCase() == 'XOR'; }
    get eqv() { return this.keyWord != null && this.keyWord.toUpperCase() == 'EQV'; }
    get imp() { return this.keyWord != null && this.keyWord.toUpperCase() == 'IMP'; }
    get arrBrOpen() { return this.keyWord != null && this.keyWord.toUpperCase() == '('; }
    get arrBrClose() { return this.keyWord != null && this.keyWord.toUpperCase() == ')'; }
    get argDelim() { return this.keyWord != null && this.keyWord.toUpperCase() == ','; }
}
OperatorLex.parse = KeyWordLex.parser(true, [
    '(', ')',
    // математические операции в порядке уменьшения приоритета
    '^',
    '*', '/',
    '\\',
    'MOD',
    '+', '-',
    '=', '<>', '><', '<', '>', '<=', '>=', '=>',
    'NOT',
    'AND',
    'OR',
    'XOR',
    // 1 XOR 1 = 0
    // 1 XOR 0 = 1
    // 0 XOR 1 = 1
    // 0 XOR 0 = 0
    'EQV',
    // 1 EQV 1 = 1
    // 1 EQV 0 = 0
    // 0 EQV 1 = 0
    // 0 EQV 0 = 1
    'IMP',
    // 0 IMP 0 = 1
    // 0 IMP 1 = 1
    // 1 IMP 0 = 0
    // 1 IMP 1 = 1
    ','
], (kw, begin, end) => { return new OperatorLex(kw, begin, end); });
exports.OperatorLex = OperatorLex;
class StatementLex extends KeyWordLex {
    constructor(keyWord, begin, end) {
        super(keyWord, begin, end);
        this.kind = 'StatementLex';
    }
    get LET() { return this.keyWord.toUpperCase() == 'LET'; }
    get RUN() { return this.keyWord.toUpperCase() == 'RUN'; }
    get GOTO() {
        if (this.keyWord.toUpperCase() == 'GOTO')
            return true;
        if (this.keyWord.toUpperCase() == 'GO TO')
            return true;
        return false;
    }
    get IF() { return this.keyWord.toUpperCase() == 'IF'; }
    get THEN() { return this.keyWord.toUpperCase() == 'THEN'; }
    get ELSE() { return this.keyWord.toUpperCase() == 'ELSE'; }
    get GOSUB() {
        if (this.keyWord.toUpperCase() == 'GO SUB')
            return true;
        if (this.keyWord.toUpperCase() == 'GOSUB')
            return true;
        return false;
    }
    get RETURN() { return this.keyWord.toUpperCase() == 'RETURN'; }
    get PRINT() { return this.keyWord.toUpperCase() == 'PRINT'; }
    get CALL() { return this.keyWord.toUpperCase() == 'CALL'; }
}
//request LIST() { return this.keyWord.toUpperCase()=='LIST' }
StatementLex.parse = KeyWordLex.parser(true, [
    'LET',
    'RUN',
    'GOTO',
    'GO TO',
    'IF',
    'THEN',
    'ELSE',
    'GO SUB',
    'GOSUB',
    'RETURN',
    'PRINT',
    'CALL',
], (kw, begin, end) => { return new StatementLex(kw, begin, end); });
exports.StatementLex = StatementLex;
/**
 * Пустая лексема
 */
class DummyLex extends AbstractLex {
    constructor() {
        super(...arguments);
        this.kind = 'DummyLex';
    }
}
exports.DummyLex = DummyLex;
/**
 * Лексема коментарий
 */
class RemLex extends AbstractLex {
    constructor(cmnt, begin, end) {
        super(begin, end);
        this.kind = 'RemLex';
        this.comment = cmnt;
    }
    static parse(str, off) {
        if (off >= str.length)
            return null;
        let rm1 = str.substring(off, off + 4);
        if (rm1.toUpperCase() == 'REM') {
            return new RemLex('', off, off + rm1.length);
        }
        if (!(rm1.toUpperCase() == 'REM '))
            return null;
        let begin = off;
        off += 4;
        while (true) {
            if (off >= str.length)
                break;
            if (Chars.isNewline(str.substring(off, off + 1))) {
                break;
            }
            off++;
        }
        let end = off;
        let cmntBegin = begin + 4;
        return new RemLex(str.substring(cmntBegin, end), begin, end);
    }
}
exports.RemLex = RemLex;
/**
 * См https://robhagemans.github.io/pcbasic/doc/1.2/#literals
 */
class NumberLex extends AbstractLex {
    constructor(val, integer, begin, end) {
        super(begin, end);
        this.value = val;
        this.integer = integer;
        this.kind = 'NumberLiteral';
    }
    static parseOct(str, off) {
        //console.log("parseOct")
        if (off >= str.length)
            return null;
        let head = str.substring(off, off + 2);
        if (!(head == '&o' || head == '&O'))
            return null;
        let num = 0;
        let kSys = 8;
        let begin = off;
        off += 2;
        while (true) {
            if (off >= str.length)
                break;
            let chDgt = str.substring(off, off + 1);
            if (!Chars.isOctDigit(chDgt)) {
                break;
            }
            num = num * kSys + Chars.octDigit(chDgt);
            off++;
        }
        let end = off;
        return new NumberLex(num, true, begin, end);
    }
    static parseHex(str, off) {
        //console.log("parseHex")
        if (off >= str.length)
            return null;
        let head = str.substring(off, off + 2);
        if (!(head == '&h' || head == '&H'))
            return null;
        let num = 0;
        let kSys = 16;
        let begin = off;
        off += 2;
        while (true) {
            if (off >= str.length)
                break;
            let chDgt = str.substring(off, off + 1);
            if (!Chars.isHexDigit(chDgt)) {
                break;
            }
            num = num * kSys + Chars.hexDigit(chDgt);
            off++;
        }
        let end = off;
        return new NumberLex(num, true, begin, end);
    }
    static parseDec(str, off) {
        //console.log("parseDec")
        if (off >= str.length)
            return null;
        let head = str.substring(off);
        /*
        > "+1234.22e+6%".match( /^([+\-]\d+)((\.\d+)(([eEdD])([+\-]?\d+))?)?([%\#!])?/ )
        [ '+1234.22e+6%',
        '+1234',
        '.22e+6',
        '.22',
        'e+6',
        'e',
        '+6',
        '%',
        index: 0,
        input: '+1234.22e+6%',
        groups: undefined ]
        */
        let m1 = head.match(/^([+\-]?\d+)((\.\d+)(([eEdD])([+\-]?\d+))?)?([%\#!])?/);
        if (m1) {
            let integer = true;
            let p1 = m1[1];
            if (m1[3])
                p1 = p1 + m1[3]; //float part
            if (m1[5] && (m1[5] == 'e' || m1[5] == 'E')) {
                p1 = p1 + m1[4]; // expo
                integer = false;
            }
            if (m1[5] && (m1[5] == 'd' || m1[5] == 'D')) {
                integer = false;
            }
            if (m1[3] && m1[3].length > 0) {
                integer = false;
            }
            let num = parseFloat(p1);
            let begin = off;
            let end = off + m1[0].length;
            return new NumberLex(num, integer, begin, end);
        }
        return null;
    }
    static parse(str, off) {
        let octn = NumberLex.parseOct(str, off);
        if (octn)
            return octn;
        let hexn = NumberLex.parseHex(str, off);
        if (hexn)
            return hexn;
        let decn = NumberLex.parseDec(str, off);
        return decn;
    }
    /**
     * Конвертирует в номер исходной строки
     */
    get asSourceLine() {
        return new SourceLineBeginLex(this.value, this.begin, this.end);
    }
}
exports.NumberLex = NumberLex;
/**
 * Строковая лексема
 */
class StringLex extends AbstractLex {
    constructor(val, begin, end) {
        super(begin, end);
        this.value = val;
        this.kind = 'StringLiteral';
    }
    static parse(str, off) {
        if (off >= str.length)
            return null;
        if (!(str.substring(off, off + 1) == '"'))
            return null;
        let begin = off;
        off++;
        let sBegin = off;
        let sEnd = -1;
        while (true) {
            if (off >= str.length)
                break;
            let ch = str.substring(off, off + 1);
            if (ch == '"') {
                sEnd = off;
                off++;
                break;
            }
            if (Chars.isNewline(ch)) {
                sEnd = off;
                break;
            }
            off++;
        }
        let end = off;
        let sVal = str.substring(sBegin, off);
        if (sEnd > sBegin) {
            sVal = str.substring(sBegin, sEnd);
        }
        return new StringLex(sVal, begin, end);
    }
}
exports.StringLex = StringLex;
/**
 * Идентификатор
 */
class IDLex extends AbstractLex {
    constructor(id, begin, end) {
        super(begin, end);
        this.kind = 'ID';
        this.id = id;
    }
    static parse(str, off) {
        if (off >= str.length)
            return null;
        let head = str.substring(off);
        let m1 = head.match(/^[a-zA-Z][a-zA-Z0-9\.]*[\#\!\%\$]?/);
        if (m1) {
            let s = m1[0];
            return new IDLex(s, off, off + s.length);
        }
        return null;
    }
}
exports.IDLex = IDLex;
/**
 * Лексемы языка BASIC
 */
exports.basicLexems = [
    NewLineLex.parse,
    WhiteSpaceLex.parse,
    RemLex.parse,
    StatementLex.parse,
    OperatorLex.parse,
    IDLex.parse,
    NumberLex.parse,
    StringLex.parse,
];
/**
 * Маркер начала строки
 */
class SourceLineBeginLex extends AbstractLex {
    constructor(line, begin, end) {
        super(begin, end);
        this.line = line;
        this.kind = 'SourceLine';
    }
}
exports.SourceLineBeginLex = SourceLineBeginLex;
/**
 * Фильтр лексем
 */
class LexIterate {
    constructor(lexs) {
        this.lexs = lexs;
    }
    get() { return this.lexs; }
    /**
     * Удаляет лексемы пробельных символов
     */
    get dropWhitespace() {
        let lexs = [];
        for (let lx of this.lexs) {
            if (!(lx instanceof WhiteSpaceLex)) {
                lexs.push(lx);
            }
        }
        return new LexIterate(lexs);
    }
    /**
     * Удаляет лексемы перевода строк
     */
    get dropNewLines() {
        let lexs = [];
        for (let lx of this.lexs) {
            if (!(lx instanceof NewLineLex)) {
                lexs.push(lx);
            }
        }
        return new LexIterate(lexs);
    }
    /**
     * Разбивает лексемы на набор строк
     */
    get lines() {
        let lines = [];
        let line = [];
        for (let lx of this.lexs) {
            if (lx instanceof SourceLineBeginLex) {
                if (line.length > 0) {
                    lines.push(line);
                }
                line = [lx];
            }
            else {
                line.push(lx);
            }
        }
        if (line.length > 0) {
            lines.push(line);
        }
        return lines;
    }
}
exports.LexIterate = LexIterate;
/**
 * Фильтр лексем
 * @param lexs лексемы
 */
function filter(lexs) {
    return new LexIterate(lexs);
}
exports.filter = filter;
const isStatement = (lx) => {
    if (lx == undefined)
        return false;
    if (lx == null)
        return false;
    if (lx instanceof RemLex)
        return true;
    if (lx instanceof StatementLex)
        return true;
    return false;
};
/**
 * Лексический анализ
 * @param source исходный текст
 */
function parseBasicLexs(source) {
    let lexs = lexems(source, exports.basicLexems);
    lexs = filter(lexs).dropWhitespace.lexs;
    let res = [];
    for (let i = 0; i < lexs.length; i++) {
        if (i == 0) {
            if (lexs[i] instanceof NumberLex &&
                (i + 1) < lexs.length &&
                isStatement(lexs[i + 1])) {
                res.push(new SourceLineBeginLex(lexs[i].value, lexs[i].begin, lexs[i].end));
            }
            else {
                res.push(lexs[i]);
            }
        }
        else {
            if (lexs[i - 1] instanceof NewLineLex &&
                lexs[i] instanceof NumberLex) {
                res.push(new SourceLineBeginLex(lexs[i].value, lexs[i].begin, lexs[i].end));
            }
            else {
                res.push(lexs[i]);
            }
        }
    }
    //return res
    return filter(res).dropNewLines.lexs;
}
exports.parseBasicLexs = parseBasicLexs;
//# sourceMappingURL=Lexer.js.map