import { Statement } from "../ast/Statement";
import { Parser } from "../ast/Parser";
import { Statements } from "../ast/Statements";

/**
 * Исходная строка
 */
export class SourceLine {
    readonly line: number
    readonly statement: Statement
    constructor(line:number, code:Statement){
        this.line = line
        this.statement = code
    }
}

/**
 * Результаты парсинга
 */
export interface ParseResult {
    /**
     * Выражения парсинга
     * @param statements выражения
     */
    statments?(statements:Statements):any

    /**
     * Выражения включенные в исходники
     * @param statements выражения
     */
    sources?(statements:Statement[]):any

    /**
     * Выражения включенные которые не именют номер строк
     * @param statements выражения
     */
    immediateStatements?(statements:Statement[]):any
}

/**
 * Исходная строка
 */
export type IDXSourceLine = {
    /**
     * Выражение BASIC
     */
    statement: Statement

    /**
     * Номер BASIC строки
     */
    line: number

    /**
     * Индекс строки
     */
    index: number
}

/**
 * Исходный текст
 */
export class SourceUnit {
    /**
     * Набор строк исхдного текста
     */
    private sourceLines : SourceLine[] = []

    /**
     * Конструктор
     * @param sample образец для копирования
     */
    constructor(sample?: SourceUnit){        
        if( sample ){
            for( let li in sample.sourceLines ){
                this.sourceLines[li] = sample.sourceLines[li]
            }
        }
    }

    //#region lines : IDXSourceLine
    private linesCache : ReadonlyArray<IDXSourceLine> | null = null

    /**
     * Возвращает список исходных строк
     */
    get lines() : ReadonlyArray<IDXSourceLine> { 
        if( this.linesCache )return this.linesCache
        let lines:IDXSourceLine[] = []
        let idx = -1
        for( let sl of this.sourceLines ){
            idx++
            lines.push( {statement:sl.statement, index:idx, line:sl.line} )
        }
        this.linesCache = Object.freeze(lines)
        return this.linesCache
    }
    //#endregion

    /**
     * Возвращает исходную строку (номер, строка / индекс) по ее номеру
     * @param line номер строки
     */
    find( line:number ) : IDXSourceLine | null {
        if( line<0 )return null
        for( let i in this.sourceLines ){
            let sline = this.sourceLines[i]
            if( sline.line == line ){
                return {statement: sline.statement, index:parseInt(i), line:sline.line}
            }
        }
        return null
    }

    /**
     * Возвращает исходную строку (номер, строка / индекс) по ее номеру
     * @param line номер строки
     */
    line( line:number ) : IDXSourceLine {
        const res = this.find(line)
        if( res )return res
        throw new Error(`source line with number ${line} not found`)
    }

    /**
     * Добавляет строку и возвращает новый объект исходного когда
     * @param line номер строки
     * @param code код
     * @returns модифицированный исходный код
     */
    set( line:number, code:Statement ) : SourceUnit {
        if( line<0 )throw new Error("argument line(="+line+") < 0")
        const fnd = this.find(line)
        if( fnd ){
            let cln = new SourceUnit(this)
            cln.sourceLines[fnd.index] = new SourceLine(line,code)
            return cln
        }
        let cln = new SourceUnit(this)
        cln.sourceLines.push( new SourceLine(line,code) )
        cln.sourceLines = cln.sourceLines.sort( (a,b)=>a.line - b.line )
        return cln
    }

    /**
     * Удаляет строку исходного кода
     * @param idx индекс строки
     * @returns модифицированный исходный код
     */
    removeByIndex( idx:number ) : SourceUnit {
        if( idx<0 )throw new Error(`argument idx(=${idx})<0`)
        if( idx>=this.sourceLines.length )return this
        
        let cln = new SourceUnit(this)
        cln.sourceLines.splice(idx,1)
        return cln
    }

    /**
     * Удялет строку исходного кода
     * @param line номер строки
     * @returns модифицированный исходный код
     */
    removeByLine( line:number ) : SourceUnit {
        if( line<0 )throw new Error(`argument line(=${line})<0`)
        const fnd = this.find(line)
        if( fnd ){
            let cln = new SourceUnit(this)
            cln.sourceLines.splice(fnd.index,1)
            return cln
        }
        return this
    }

    /**
     * Парсинг исходного текста
     * @param source исходный текст
     * @param presult результат парсинга
     */
    parse( source:string, presult?:ParseResult ):SourceUnit {
        if( source ){
            const parser = Parser.create(source)
            const stmts = parser.statements()
            let res : SourceUnit = this
            if( stmts ){
                const sstmts:Statement[] = []
                const istmts:Statement[] = []
                if( presult && presult.statments ){
                    presult.statments( stmts )
                }
                for( let st of stmts.statements ){
                    if( st.sourceLine ){
                        res = res.set( st.sourceLine, st )
                        sstmts.push( st )
                    }else {
                        istmts.push( st )
                    }
                }
                if( presult && presult.sources ){
                    presult.sources( sstmts )
                }
                if( presult && presult.immediateStatements ){
                    presult.immediateStatements( istmts )
                }
            }
            return res
        }
        return this
    }
}

/**
 * Парсинг исходника
 * @param source исходник
 */
export function parse(source:string):SourceUnit {
    return new SourceUnit().parse(source)
}