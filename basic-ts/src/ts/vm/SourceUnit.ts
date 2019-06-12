import { Statement } from "../ast/Statement";

/**
 * Исходная строка
 */
export class SourceLine {
    readonly line: number
    readonly code: Statement
    constructor(line:number, code:Statement){
        this.line = line
        this.code = code
    }
}

/**
 * Исходный текст
 */
export class SourceUnit {    
    private sourceLines : SourceLine[] = []
    constructor(sample?: SourceUnit){        
        if( sample!=null ){
            for( let li in sample.sourceLines ){
                this.sourceLines[li] = sample.sourceLines[li]
            }
        }
    }

    private linesCache : ReadonlyArray<SourceLine> | null = null

    /**
     * Возвращает список исходных строк
     */
    get lines() : ReadonlyArray<SourceLine> { 
        if( this.linesCache )return this.linesCache
        this.linesCache = Object.freeze(this.sourceLines)
        return this.linesCache
    }

    /**
     * Возвращает исходную строку (номер, строка / индекс) по ее номеру
     * @param line номер строки
     */
    find( line:number ) : {sline:SourceLine, index:number} | null {
        if( line<0 )return null
        for( let i in this.sourceLines ){
            let sline = this.sourceLines[i]
            if( sline.line == line )return {sline:sline, index:parseInt(i)}
        }
        return null
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
}