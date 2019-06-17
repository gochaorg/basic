/**
 * Работа с лексемами BASIC
 */

/**
 * Определяет лексему
 */
export interface Lex {
    /** Начало лексемы в тексте */
    readonly begin:number

    /** Конец лексемы в тексте */
    readonly end:number
}

/**
 * Абстрактная поддержка лексем
 */
export abstract class AbstractLex implements Lex {
    readonly begin: number;
    readonly end: number;
    constructor(begin?:number, end?:number){
        if( begin!==undefined ) {
            this.begin = begin
        }else{
            this.begin = 0
        }

        if( end!==undefined ){
            this.end = end
        }else{
            this.end = 0
        }
    }
}

/**
 * Получение списка лексем из текста
 * @param text текст
 * @param lexs парсеры лексем
 */
export function lexems( text:string, lexs:((str:string, off:number)=>Lex|null)[] ) : Lex[] {
    let res : Lex[] = []
    let off = 0
    while( true ){
        if( off>=text.length )break
        let lx = null
        for( let lxParse of lexs ){
            if( lx!=null )break
            lx = lxParse(text,off)
            if( lx!=null ){
                if( lx.end<=off )throw new Error("fail lexem parse, end(="+lx.end+") < off(="+off+")")
                res.push( lx )
                off = lx.end
                break
            }
        }
        if( lx==null )throw new Error("can't parse "+text.substring(off,off+50))
    }
    return res
}

/**
 * Поддержка разных классов символов
 */
export class Chars {
    static isWS(str:string) {
        if( str==' ' )return true
        if( str=='\n' )return true
        if( str=='\r' )return true
        if( str=='\t' )return true
        return false
    }
    static isNewline(str:string) {
        if( str=='\n' )return true
        if( str=='\r' )return true
        if( str=='\n\r' )return true
        if( str=='\r\n' )return true
        return false
    }
    static isHexDigit(str:string){
        if( str=='0' || str=='1' || str=='2' || str=='3' || str=='4' ) return true
        if( str=='5' || str=='6' || str=='7' || str=='8' || str=='9' ) return true
        if( str=='A' || str=='B' || str=='C' ) return true
        if( str=='D' || str=='E' || str=='F' ) return true
        if( str=='a' || str=='b' || str=='c' ) return true
        if( str=='d' || str=='e' || str=='f' ) return true
        return false
    }
    static hexDigit(str:string):number {
        if(!Chars.isHexDigit(str))throw new Error("not a digit")
        if(str=='0')return 0
        if(str=='1')return 1
        if(str=='2')return 2
        if(str=='3')return 3
        if(str=='4')return 4
        if(str=='5')return 5
        if(str=='6')return 6
        if(str=='7')return 7
        if(str=='8')return 8
        if(str=='9')return 9
        if(str=='a' || str=='A')return 10
        if(str=='b' || str=='B')return 11
        if(str=='c' || str=='C')return 12
        if(str=='d' || str=='D')return 13
        if(str=='e' || str=='E')return 14
        if(str=='f' || str=='F')return 15
        throw new Error("not a digit")
    }
    static isDecDigit(str:string){
        if( str=='0' || str=='1' || str=='2' || str=='3' || str=='4' ) return true
        if( str=='5' || str=='6' || str=='7' || str=='8' || str=='9' ) return true
        return false
    }
    static decDigit(str:string):number {
        if(!Chars.isDecDigit(str))throw new Error("not a digit")
        if(str=='0')return 0
        if(str=='1')return 1
        if(str=='2')return 2
        if(str=='3')return 3
        if(str=='4')return 4
        if(str=='5')return 5
        if(str=='6')return 6
        if(str=='7')return 7
        if(str=='8')return 8
        if(str=='9')return 9
        throw new Error("not a digit")
    }
    static isOctDigit(str:string){
        if( str=='0' || str=='1' || str=='2' || str=='3' || str=='4' ) return true
        if( str=='5' || str=='6' || str=='7' ) return true
        return false
    }
    static octDigit(str:string):number {
        if(!Chars.isOctDigit(str))throw new Error("not a digit")
        if(str=='0')return 0
        if(str=='1')return 1
        if(str=='2')return 2
        if(str=='3')return 3
        if(str=='4')return 4
        if(str=='5')return 5
        if(str=='6')return 6
        if(str=='7')return 7
        throw new Error("not a digit")
    }
}

/**
 * Лексема пробельного текста
 */
export class WhiteSpaceLex extends AbstractLex {
    constructor(begin?:number, end?:number){
        super(begin,end)
    }
    static parse(str:string, off:number):Lex|null {
        if( off>=str.length )return null
        if( !Chars.isWS(str.substr(off,1)) )return null
        let from = off
        while(true){
            if( off>=str.length )break
            if( !Chars.isWS(str.substr(off,1)) )break
            off++
        }
        let to = off
        return new WhiteSpaceLex(from,to)
    }
}

/**
 * Лексема ключевых слов
 */
export class KeyWordLex extends AbstractLex {
    readonly keyWord:string
    constructor(keyWord:string, begin?:number, end?:number){
        super(begin,end)
        this.keyWord = keyWord
    }
    static defaultKeyWordBuilder : (kw:string, kwBegin:number, kwEnd:number)=>Lex = (kw,kwBegin,kwEnd) => {
        return new KeyWordLex(kw, kwBegin, kwEnd)
    }
    static parser(ignorecase:boolean,keyWords:string[], keyWordBuilder?:(kw:string, kwBegin:number, kwEnd:number)=>Lex ) {
        keyWords = keyWords.sort( (a,b) => 0-(a.length - b.length) )
        return (str:string, off:number):Lex|null=>{
            if( off>=str.length )return null
            for( let kw of keyWords ){
                let ss = str.substring(off,off+kw.length)
                if( (ignorecase && ss.toUpperCase()==kw.toUpperCase()) || 
                    (!ignorecase && ss==kw) 
                ){
                    //return new KeyWordLex(ss,off,off+ss.length)
                    if( keyWordBuilder ){
                        return keyWordBuilder(ss,off,off+ss.length)
                    }else{
                        return new KeyWordLex(ss,off,off+ss.length)
                    }
                }
            }
            return null
        }
    }
}

/**
 * Лексема начала новой строки
 */
export class NewLineLex extends KeyWordLex {
    readonly kind:string
    constructor(keyWord:string, begin?:number, end?:number){
        super(keyWord, begin,end)
        this.kind = 'NewLineSeparator'
    }
    static parse = KeyWordLex.parser(
        false,
        ['\n\r', '\r\n', '\n', '\r'], 
        (kw,begin,end)=>{return new NewLineLex(kw,begin,end)}
        )
}

/**
 * Лексема встроенного оператора
 */
export class OperatorLex extends KeyWordLex {
    /*
    static readonly POW = '^'
    static readonly MULT = '*'
    static readonly DIV = '/'
    static readonly IDIV = '\\'
    static readonly MOD = 'MOD'
    static readonly PLUS = '+'
    static readonly MINUS = '-'
    static readonly EQUALS = '-'
    */

    readonly kind:string
    constructor(keyWord:string, begin?:number, end?:number){
        super(keyWord, begin,end)
        this.kind = 'OperatorLex'
    }
    static parse = KeyWordLex.parser( true,
        [
            '(',    ')',    // круглые скобки, используются для группировки мат оперций, вызова функций, доступ к элементам массива
            // математические операции в порядке уменьшения приоритета
            '^',
            '*',    '/',
            '\\',           // Divides two numbers and returns an integer result.
            'MOD',          //
            '+', '-',       //
            '=', '<>', '><', '<', '>', '<=', '>=', '=>',
            'NOT',
            'AND',
            'OR',
            'XOR',          // a XOR b = result
                            // 1 XOR 1 = 0
                            // 1 XOR 0 = 1
                            // 0 XOR 1 = 1
                            // 0 XOR 0 = 0
            'EQV',          // a EQV b = result
                            // 1 EQV 1 = 1
                            // 1 EQV 0 = 0
                            // 0 EQV 1 = 0
                            // 0 EQV 0 = 1
            'IMP',          // a IMP b = result
                            // 0 IMP 0 = 1
                            // 0 IMP 1 = 1
                            // 1 IMP 0 = 0
                            // 1 IMP 1 = 1
        ], 
        (kw,begin,end)=>{return new OperatorLex(kw,begin,end)}
        );
    get pow(){ return this.keyWord!=null && this.keyWord=='^' }
    get mult(){ return this.keyWord!=null && this.keyWord=='*' }
    get div(){ return this.keyWord!=null && this.keyWord=='/' }
    get idiv(){ return this.keyWord!=null && this.keyWord=='\\' }
    get mod(){ return this.keyWord!=null && this.keyWord.toUpperCase()=='MOD' }
    get plus(){ return this.keyWord!=null && this.keyWord=='+' }
    get minus(){ return this.keyWord!=null && this.keyWord=='-' }
    get equals(){ return this.keyWord!=null && this.keyWord=='=' }
    get notEquals(){ return this.keyWord!=null && (this.keyWord=='<>' || this.keyWord=='><') }
    get less(){ return this.keyWord!=null && this.keyWord=='<' }
    get lesOrEquals(){ return this.keyWord!=null && (this.keyWord=='<=' || this.keyWord=='=<') }
    get more(){ return this.keyWord!=null && this.keyWord=='>' }
    get moreOrEquals(){ return this.keyWord!=null && (this.keyWord=='>=' || this.keyWord=='=>') }
    get ordReleation(){ return this.more || this.moreOrEquals || this.equals || this.notEquals || this.lesOrEquals || this.less }
    get not(){ return this.keyWord!=null && this.keyWord.toUpperCase()=='NOT' }
    get and(){ return this.keyWord!=null && this.keyWord.toUpperCase()=='AND' }
    get or(){ return this.keyWord!=null && this.keyWord.toUpperCase()=='OR' }
    get xor(){ return this.keyWord!=null && this.keyWord.toUpperCase()=='XOR' }
    get eqv(){ return this.keyWord!=null && this.keyWord.toUpperCase()=='EQV' }
    get imp(){ return this.keyWord!=null && this.keyWord.toUpperCase()=='IMP' }
}

export class StatementLex extends KeyWordLex {
    readonly kind:string
    constructor(keyWord:string, begin?:number, end?:number){
        super(keyWord, begin,end)
        this.kind = 'StatementLex'
    }
    get LET() { return this.keyWord.toUpperCase()=='LET' }
    get RUN() { return this.keyWord.toUpperCase()=='RUN' }
    get LIST() { return this.keyWord.toUpperCase()=='LIST' }
    static parse = KeyWordLex.parser(
        true,
        [                
            'LET', // Оператор присвоения значения переменной
            'RUN', 
            'LIST', 
        ], 
        (kw,begin,end)=>{return new StatementLex(kw,begin,end)}
        )
}

/**
 * Пустая лексема
 */
export class DummyLex extends AbstractLex {}

/**
 * Лексема коментарий
 */
export class RemLex extends AbstractLex {
    readonly comment:string
    readonly kind:string
    constructor(cmnt:string, begin?:number, end?:number){
        super(begin,end)
        this.comment = cmnt
        this.kind = 'RemLex'
    }

    static parse(str:string, off:number):Lex|null {
        if( off>=str.length )return null
        let rm1 = str.substring(off,off+4)
        if( rm1.toUpperCase()=='REM' ){
            return new RemLex('',off,off+rm1.length)
        }
        if( !(rm1.toUpperCase()=='REM ') )return null

        let begin = off
        off += 4
        while(true){
            if( off>=str.length )break
            if( Chars.isNewline( str.substring(off,off+1) ) ){
                break
            }
            off++
        }
        let end = off

        let cmntBegin = begin+4
        return new RemLex(str.substring(cmntBegin,end),begin,end)
    }
}

/**
 * См https://robhagemans.github.io/pcbasic/doc/1.2/#literals
 */
export class NumberLex extends AbstractLex {
    readonly value:number
    readonly kind:string
    readonly integer:boolean
    constructor(val:number, integer:boolean, begin?:number, end?:number){
        super(begin,end)
        this.value = val
        this.integer = integer
        this.kind = 'NumberLiteral'
    }
    static parseOct(str:string, off:number):Lex|null {
        //console.log("parseOct")
        if( off>=str.length )return null
        
        let head = str.substring(off,off+2)
        if( !(head=='&o' || head=='&O') )return null

        let num = 0
        let kSys = 8
        let begin = off

        off+=2
        while(true){
            if( off>=str.length )break
            let chDgt = str.substring(off,off+1)                
            if( !Chars.isOctDigit(chDgt) ){
                break
            }
            num = num * kSys + Chars.octDigit(chDgt)
            off++
        }
        let end = off
        return new NumberLex(num,true,begin,end)
    }
    static parseHex(str:string, off:number):Lex|null {
        //console.log("parseHex")
        if( off>=str.length )return null
        
        let head = str.substring(off,off+2)
        if( !(head=='&h' || head=='&H') )return null

        let num = 0
        let kSys = 16
        let begin = off
        
        off+=2
        while(true){
            if( off>=str.length )break
            let chDgt = str.substring(off,off+1)                
            if( !Chars.isHexDigit(chDgt) ){
                break
            }
            num = num * kSys + Chars.hexDigit(chDgt)
            off++
        }
        let end = off
        return new NumberLex(num,true,begin,end)
    }
    static parseDec(str:string, off:number):Lex|null {
        //console.log("parseDec")
        if( off>=str.length )return null
        let head = str.substring(off)
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
        let m1 = head.match( /^([+\-]?\d+)((\.\d+)(([eEdD])([+\-]?\d+))?)?([%\#!])?/ )
        if( m1 ){
            let integer = true
            let p1 = m1[1];
            if( m1[3] ) p1 = p1 + m1[3] //float part
            if( m1[5] && (m1[5]=='e' || m1[5]=='E') ){
                p1 = p1 + m1[4] // expo
                integer = false
            }
            if( m1[5] && (m1[5]=='d' || m1[5]=='D') ){
                integer = false
            }
            if( m1[3] && m1[3].length>0 ){
                integer = false
            }
            let num = parseFloat(p1)
            let begin = off
            let end = off + m1[0].length
            return new NumberLex(num,integer,begin,end)
        }
        return null            
    }
    static parse(str:string, off:number):Lex|null {            
        let octn = NumberLex.parseOct(str,off)
        if( octn )return octn

        let hexn = NumberLex.parseHex(str,off)
        if( hexn )return hexn

        let decn = NumberLex.parseDec(str,off)
        return decn
    }

    /**
     * Конвертирует в номер исходной строки
     */
    get asSourceLine():SourceLineBeginLex {
        return new SourceLineBeginLex(this.value, this.begin, this.end)
    }
}

/**
 * Строковая лексема
 */
export class StringLex extends AbstractLex {
    readonly value:string
    readonly kind:string
    constructor(val:string, begin?:number, end?:number){
        super(begin,end)
        this.value = val
        this.kind = 'StringLiteral'
    }
    static parse(str:string, off:number):Lex|null {
        if( off>=str.length )return null
        if( !(str.substring(off,off+1)=='"') )return null            
        let begin = off
        off++
        let sBegin = off
        let sEnd = -1
        while(true){
            if( off>=str.length )break
            let ch = str.substring(off,off+1)
            if( ch=='"' ){
                sEnd = off
                off++
                break
            }
            if( Chars.isNewline(ch) ){
                sEnd = off
                break
            }
            off++
        }
        let end = off
        let sVal = str.substring(sBegin,off)
        if( sEnd>sBegin ){
            sVal = str.substring(sBegin,sEnd)
        }
        return new StringLex(sVal,begin,end)
    }
}

/**
 * Идентификатор
 */
export class IDLex extends AbstractLex {
    readonly id:string
    readonly kind:string
    constructor(id:string, begin?:number, end?:number){
        super(begin,end)
        this.id = id
        this.kind = 'ID'
    }
    static parse(str:string, off:number):Lex|null {
        if( off>=str.length )return null
        let head = str.substring(off)
        let m1 = head.match( /^[a-zA-Z][a-zA-Z0-9\.]*[\#\!\%\$]?/ )
        if( m1 ){
            let s = m1[0]
            return new IDLex(s,off,off+s.length)
        }
        return null
    }
}

/**
 * Лексемы языка BASIC
 */
export const basicLexems:((str:string, off:number)=>Lex|null)[] = [
    NewLineLex.parse,
    WhiteSpaceLex.parse,
    RemLex.parse,
    StatementLex.parse,
    OperatorLex.parse,
    IDLex.parse,
    NumberLex.parse,
    StringLex.parse,
]

/**
 * Маркер начала строки
 */
export class SourceLineBeginLex extends AbstractLex {
    readonly line:number
    readonly kind:string
    constructor(line:number, begin:number, end:number){
        super(begin,end)
        this.line = line
        this.kind = 'SourceLine'
    }
}

/**
 * Фильтр лексем
 */
export class LexIterate {
    lexs:Lex[]
    constructor(lexs:Lex[]){
        this.lexs = lexs
    }
    get():Lex[] { return this.lexs }

    /**
     * Удаляет лексемы пробельных символов
     */
    get dropWhitespace():LexIterate {
        let lexs : Lex[] = []
        for( let lx of this.lexs ){
            if( !(lx instanceof WhiteSpaceLex) ){
                lexs.push(lx)
            }
        }
        return new LexIterate(lexs)
    }

    /**
     * Удаляет лексемы перевода строк
     */
    get dropNewLines():LexIterate {
        let lexs : Lex[] = []
        for( let lx of this.lexs ){
            if( !(lx instanceof NewLineLex) ){
                lexs.push(lx)
            }
        }
        return new LexIterate(lexs)
    }

    /**
     * Разбивает лексемы на набор строк
     */
    get lines():Lex[][] {
        let lines:Lex[][] = []
        let line:Lex[] = []
        for( let lx of this.lexs ){
            if( lx instanceof SourceLineBeginLex ){
                if( line.length>0 ){
                    lines.push( line )
                }                    
                line = [ lx ]
            }else{
                line.push( lx )
            }
        }
        if( line.length>0 ){
            lines.push( line )
        }
        return lines
    }
}

/**
 * Фильтр лексем
 * @param lexs лексемы
 */
export function filter( lexs:Lex[] ):LexIterate {
    return new LexIterate(lexs)
}

const isStatement = ( lx:any ):boolean => {
    if( lx==undefined )return false
    if( lx==null )return false
    if( lx instanceof RemLex )return true
    if( lx instanceof StatementLex )return true
    return false
}

/**
 * Лексический анализ
 * @param source исходный текст
 */
export function parseBasicLexs( source:string ):Lex[] {
    let lexs = lexems(source, basicLexems)
    lexs = filter(lexs).dropWhitespace.lexs

    let res : Lex[] = []
    for( let i=0; i<lexs.length; i++ ){
        if( i==0 ){
            if( lexs[i] instanceof NumberLex &&
                (i+1) < lexs.length &&
                isStatement(lexs[i+1])
            ){
                res.push( new SourceLineBeginLex(
                    (lexs[i] as NumberLex).value,
                    lexs[i].begin,
                    lexs[i].end
                ))
            }else{
                res.push( lexs[i] )
            }
        }else{
            if( lexs[i-1] instanceof NewLineLex &&
                lexs[i] instanceof NumberLex
            ){
                res.push( new SourceLineBeginLex(
                    (lexs[i] as NumberLex).value,
                    lexs[i].begin,
                    lexs[i].end
                ))
            }else{
                res.push( lexs[i] )
            }
        }
    }

    //return res
    return filter(res).dropNewLines.lexs
}

