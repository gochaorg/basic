"use strict";
/**
 * Работа с лексемами BASIC
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Абстрактная поддержка лексем
 */
var AbstractLex = /** @class */ (function () {
    function AbstractLex(begin, end) {
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
    return AbstractLex;
}());
exports.AbstractLex = AbstractLex;
/**
 * Получение списка лексем из текста
 * @param text текст
 * @param lexs парсеры лексем
 */
function lexems(text, lexs) {
    var res = [];
    var off = 0;
    while (true) {
        if (off >= text.length)
            break;
        var lx = null;
        for (var _i = 0, lexs_1 = lexs; _i < lexs_1.length; _i++) {
            var lxParse = lexs_1[_i];
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
 * ПОддержка разных классов символов
 */
var Chars = /** @class */ (function () {
    function Chars() {
    }
    Chars.isWS = function (str) {
        if (str == ' ')
            return true;
        if (str == '\n')
            return true;
        if (str == '\r')
            return true;
        if (str == '\t')
            return true;
        return false;
    };
    Chars.isNewline = function (str) {
        if (str == '\n')
            return true;
        if (str == '\r')
            return true;
        if (str == '\n\r')
            return true;
        if (str == '\r\n')
            return true;
        return false;
    };
    Chars.isHexDigit = function (str) {
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
    };
    Chars.hexDigit = function (str) {
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
    };
    Chars.isDecDigit = function (str) {
        if (str == '0' || str == '1' || str == '2' || str == '3' || str == '4')
            return true;
        if (str == '5' || str == '6' || str == '7' || str == '8' || str == '9')
            return true;
        return false;
    };
    Chars.decDigit = function (str) {
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
    };
    Chars.isOctDigit = function (str) {
        if (str == '0' || str == '1' || str == '2' || str == '3' || str == '4')
            return true;
        if (str == '5' || str == '6' || str == '7')
            return true;
        return false;
    };
    Chars.octDigit = function (str) {
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
    };
    return Chars;
}());
exports.Chars = Chars;
/**
 * Лексема пробельного текста
 */
var WhiteSpaceLex = /** @class */ (function (_super) {
    __extends(WhiteSpaceLex, _super);
    function WhiteSpaceLex(begin, end) {
        return _super.call(this, begin, end) || this;
    }
    WhiteSpaceLex.parse = function (str, off) {
        if (off >= str.length)
            return null;
        if (!Chars.isWS(str.substr(off, 1)))
            return null;
        var from = off;
        while (true) {
            if (off >= str.length)
                break;
            if (!Chars.isWS(str.substr(off, 1)))
                break;
            off++;
        }
        var to = off;
        return new WhiteSpaceLex(from, to);
    };
    return WhiteSpaceLex;
}(AbstractLex));
exports.WhiteSpaceLex = WhiteSpaceLex;
/**
 * Лексема ключевых слов
 */
var KeyWordLex = /** @class */ (function (_super) {
    __extends(KeyWordLex, _super);
    function KeyWordLex(keyWord, begin, end) {
        var _this = _super.call(this, begin, end) || this;
        _this.keyWord = keyWord;
        return _this;
    }
    KeyWordLex.parser = function (ignorecase, keyWords, keyWordBuilder) {
        keyWords = keyWords.sort(function (a, b) { return 0 - (a.length - b.length); });
        return function (str, off) {
            if (off >= str.length)
                return null;
            for (var _i = 0, keyWords_1 = keyWords; _i < keyWords_1.length; _i++) {
                var kw = keyWords_1[_i];
                var ss = str.substring(off, off + kw.length);
                if ((ignorecase && ss.toUpperCase() == kw.toUpperCase()) ||
                    (!ignorecase && ss == kw)) {
                    //return new KeyWordLex(ss,off,off+ss.length)
                    if (keyWordBuilder) {
                        return keyWordBuilder(ss, off, off + ss.length);
                    }
                    else {
                        return new KeyWordLex(ss, off, off + ss.length);
                    }
                }
            }
            return null;
        };
    };
    KeyWordLex.defaultKeyWordBuilder = function (kw, kwBegin, kwEnd) {
        return new KeyWordLex(kw, kwBegin, kwEnd);
    };
    return KeyWordLex;
}(AbstractLex));
exports.KeyWordLex = KeyWordLex;
/**
 * Лексема начала новой строки
 */
var NewLineLex = /** @class */ (function (_super) {
    __extends(NewLineLex, _super);
    function NewLineLex(keyWord, begin, end) {
        var _this = _super.call(this, keyWord, begin, end) || this;
        _this.kind = 'NewLineSeparator';
        return _this;
    }
    NewLineLex.parse = KeyWordLex.parser(false, ['\n\r', '\r\n', '\n', '\r'], function (kw, begin, end) { return new NewLineLex(kw, begin, end); });
    return NewLineLex;
}(KeyWordLex));
exports.NewLineLex = NewLineLex;
/**
 * Лексема встроенного оператора
 */
var OperatorLex = /** @class */ (function (_super) {
    __extends(OperatorLex, _super);
    function OperatorLex(keyWord, begin, end) {
        var _this = _super.call(this, keyWord, begin, end) || this;
        _this.kind = 'OperatorLex';
        return _this;
    }
    Object.defineProperty(OperatorLex.prototype, "pow", {
        get: function () { return this.keyWord != null && this.keyWord == '^'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "mult", {
        get: function () { return this.keyWord != null && this.keyWord == '*'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "div", {
        get: function () { return this.keyWord != null && this.keyWord == '/'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "idiv", {
        get: function () { return this.keyWord != null && this.keyWord == '\\'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "mod", {
        get: function () { return this.keyWord != null && this.keyWord.toUpperCase() == 'MOD'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "plus", {
        get: function () { return this.keyWord != null && this.keyWord == '+'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "minus", {
        get: function () { return this.keyWord != null && this.keyWord == '-'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "equals", {
        get: function () { return this.keyWord != null && this.keyWord == '='; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "notEquals", {
        get: function () { return this.keyWord != null && (this.keyWord == '<>' || this.keyWord == '><'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "less", {
        get: function () { return this.keyWord != null && this.keyWord == '<'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "lesOrEquals", {
        get: function () { return this.keyWord != null && (this.keyWord == '<=' || this.keyWord == '=<'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "more", {
        get: function () { return this.keyWord != null && this.keyWord == '>'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "moreOrEquals", {
        get: function () { return this.keyWord != null && (this.keyWord == '>=' || this.keyWord == '=>'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "ordReleation", {
        get: function () { return this.more || this.moreOrEquals || this.equals || this.notEquals || this.lesOrEquals || this.less; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "not", {
        get: function () { return this.keyWord != null && this.keyWord.toUpperCase() == 'NOT'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "and", {
        get: function () { return this.keyWord != null && this.keyWord.toUpperCase() == 'AND'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "or", {
        get: function () { return this.keyWord != null && this.keyWord.toUpperCase() == 'OR'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "xor", {
        get: function () { return this.keyWord != null && this.keyWord.toUpperCase() == 'XOR'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "eqv", {
        get: function () { return this.keyWord != null && this.keyWord.toUpperCase() == 'EQV'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperatorLex.prototype, "imp", {
        get: function () { return this.keyWord != null && this.keyWord.toUpperCase() == 'IMP'; },
        enumerable: true,
        configurable: true
    });
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
    ], function (kw, begin, end) { return new OperatorLex(kw, begin, end); });
    return OperatorLex;
}(KeyWordLex));
exports.OperatorLex = OperatorLex;
var StatementLex = /** @class */ (function (_super) {
    __extends(StatementLex, _super);
    function StatementLex(keyWord, begin, end) {
        var _this = _super.call(this, keyWord, begin, end) || this;
        _this.kind = 'StatementLex';
        return _this;
    }
    StatementLex.parse = KeyWordLex.parser(true, [
        'LET',
        'RUN',
        'LIST',
    ], function (kw, begin, end) { return new StatementLex(kw, begin, end); });
    return StatementLex;
}(KeyWordLex));
exports.StatementLex = StatementLex;
/**
 * Пустая лексема
 */
var DummyLex = /** @class */ (function (_super) {
    __extends(DummyLex, _super);
    function DummyLex() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DummyLex;
}(AbstractLex));
exports.DummyLex = DummyLex;
/**
 * Лексема коментарий
 */
var RemLex = /** @class */ (function (_super) {
    __extends(RemLex, _super);
    function RemLex(cmnt, begin, end) {
        var _this = _super.call(this, begin, end) || this;
        _this.comment = cmnt;
        _this.kind = 'RemLex';
        return _this;
    }
    RemLex.parse = function (str, off) {
        if (off >= str.length)
            return null;
        var rm1 = str.substring(off, off + 4);
        if (rm1 == 'REM') {
            return new RemLex('', off, off + rm1.length);
        }
        if (!(rm1 == 'REM '))
            return null;
        var begin = off;
        off += 4;
        while (true) {
            if (off >= str.length)
                break;
            if (Chars.isNewline(str.substring(off, off + 1))) {
                break;
            }
            off++;
        }
        var end = off;
        var cmntBegin = begin + 4;
        return new RemLex(str.substring(cmntBegin, end), begin, end);
    };
    return RemLex;
}(AbstractLex));
exports.RemLex = RemLex;
/**
 * См https://robhagemans.github.io/pcbasic/doc/1.2/#literals
 */
var NumberLex = /** @class */ (function (_super) {
    __extends(NumberLex, _super);
    function NumberLex(val, integer, begin, end) {
        var _this = _super.call(this, begin, end) || this;
        _this.value = val;
        _this.integer = integer;
        _this.kind = 'NumberLiteral';
        return _this;
    }
    NumberLex.parseOct = function (str, off) {
        //console.log("parseOct")
        if (off >= str.length)
            return null;
        var head = str.substring(off, off + 2);
        if (!(head == '&o' || head == '&O'))
            return null;
        var num = 0;
        var kSys = 8;
        var begin = off;
        off += 2;
        while (true) {
            if (off >= str.length)
                break;
            var chDgt = str.substring(off, off + 1);
            if (!Chars.isOctDigit(chDgt)) {
                break;
            }
            num = num * kSys + Chars.octDigit(chDgt);
            off++;
        }
        var end = off;
        return new NumberLex(num, true, begin, end);
    };
    NumberLex.parseHex = function (str, off) {
        //console.log("parseHex")
        if (off >= str.length)
            return null;
        var head = str.substring(off, off + 2);
        if (!(head == '&h' || head == '&H'))
            return null;
        var num = 0;
        var kSys = 16;
        var begin = off;
        off += 2;
        while (true) {
            if (off >= str.length)
                break;
            var chDgt = str.substring(off, off + 1);
            if (!Chars.isHexDigit(chDgt)) {
                break;
            }
            num = num * kSys + Chars.hexDigit(chDgt);
            off++;
        }
        var end = off;
        return new NumberLex(num, true, begin, end);
    };
    NumberLex.parseDec = function (str, off) {
        //console.log("parseDec")
        if (off >= str.length)
            return null;
        var head = str.substring(off);
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
        var m1 = head.match(/^([+\-]?\d+)((\.\d+)(([eEdD])([+\-]?\d+))?)?([%\#!])?/);
        if (m1) {
            var integer = true;
            var p1 = m1[1];
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
            var num = parseFloat(p1);
            var begin = off;
            var end = off + m1[0].length;
            return new NumberLex(num, integer, begin, end);
        }
        return null;
    };
    NumberLex.parse = function (str, off) {
        var octn = NumberLex.parseOct(str, off);
        if (octn)
            return octn;
        var hexn = NumberLex.parseHex(str, off);
        if (hexn)
            return hexn;
        var decn = NumberLex.parseDec(str, off);
        return decn;
    };
    Object.defineProperty(NumberLex.prototype, "asSourceLine", {
        /**
         * Конвертирует в номер исходной строки
         */
        get: function () {
            return new SourceLineBeginLex(this.value, this.begin, this.end);
        },
        enumerable: true,
        configurable: true
    });
    return NumberLex;
}(AbstractLex));
exports.NumberLex = NumberLex;
/**
 * Строковая лексема
 */
var StringLex = /** @class */ (function (_super) {
    __extends(StringLex, _super);
    function StringLex(val, begin, end) {
        var _this = _super.call(this, begin, end) || this;
        _this.value = val;
        _this.kind = 'StringLiteral';
        return _this;
    }
    StringLex.parse = function (str, off) {
        if (off >= str.length)
            return null;
        if (!(str.substring(off, off + 1) == '"'))
            return null;
        var begin = off;
        off++;
        var sBegin = off;
        var sEnd = -1;
        while (true) {
            if (off >= str.length)
                break;
            var ch = str.substring(off, off + 1);
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
        var end = off;
        var sVal = str.substring(sBegin, off);
        if (sEnd > sBegin) {
            sVal = str.substring(sBegin, sEnd);
        }
        return new StringLex(sVal, begin, end);
    };
    return StringLex;
}(AbstractLex));
exports.StringLex = StringLex;
/**
 * Идентификатор
 */
var IDLex = /** @class */ (function (_super) {
    __extends(IDLex, _super);
    function IDLex(id, begin, end) {
        var _this = _super.call(this, begin, end) || this;
        _this.id = id;
        _this.kind = 'ID';
        return _this;
    }
    IDLex.parse = function (str, off) {
        if (off >= str.length)
            return null;
        var head = str.substring(off);
        var m1 = head.match(/^[a-zA-Z][a-zA-Z0-9\.]*[\#\!\%\$]?/);
        if (m1) {
            var s = m1[0];
            return new IDLex(s, off, off + s.length);
        }
        return null;
    };
    return IDLex;
}(AbstractLex));
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
var SourceLineBeginLex = /** @class */ (function (_super) {
    __extends(SourceLineBeginLex, _super);
    function SourceLineBeginLex(line, begin, end) {
        var _this = _super.call(this, begin, end) || this;
        _this.line = line;
        _this.kind = 'SourceLine';
        return _this;
    }
    return SourceLineBeginLex;
}(AbstractLex));
exports.SourceLineBeginLex = SourceLineBeginLex;
/**
 * Фильтр лексем
 */
var LexIterate = /** @class */ (function () {
    function LexIterate(lexs) {
        this.lexs = lexs;
    }
    LexIterate.prototype.get = function () { return this.lexs; };
    Object.defineProperty(LexIterate.prototype, "dropWhitespace", {
        /**
         * Удаляет лексемы пробельных символов
         */
        get: function () {
            var lexs = [];
            for (var _i = 0, _a = this.lexs; _i < _a.length; _i++) {
                var lx = _a[_i];
                if (!(lx instanceof WhiteSpaceLex)) {
                    lexs.push(lx);
                }
            }
            return new LexIterate(lexs);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LexIterate.prototype, "dropNewLines", {
        /**
         * Удаляет лексемы перевода строк
         */
        get: function () {
            var lexs = [];
            for (var _i = 0, _a = this.lexs; _i < _a.length; _i++) {
                var lx = _a[_i];
                if (!(lx instanceof NewLineLex)) {
                    lexs.push(lx);
                }
            }
            return new LexIterate(lexs);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LexIterate.prototype, "lines", {
        /**
         * Разбивает лексемы на набор строк
         */
        get: function () {
            var lines = [];
            var line = [];
            for (var _i = 0, _a = this.lexs; _i < _a.length; _i++) {
                var lx = _a[_i];
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
        },
        enumerable: true,
        configurable: true
    });
    return LexIterate;
}());
exports.LexIterate = LexIterate;
/**
 * Фильтр лексем
 * @param lexs лексемы
 */
function filter(lexs) {
    return new LexIterate(lexs);
}
exports.filter = filter;
var isStatement = function (lx) {
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
    var lexs = lexems(source, exports.basicLexems);
    lexs = filter(lexs).dropWhitespace.lexs;
    var res = [];
    for (var i = 0; i < lexs.length; i++) {
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