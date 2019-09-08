import { Lex, SourceLineBeginLex } from './Lexer'

/**
 * Некий кусок кода, который по традиции должен умещаться в одной строке
 */
export abstract class Statement {
    /**
     * Начальная лексема
     */
    abstract readonly begin:Lex

    /**
     * Конечная лексема
     */
    abstract readonly end:Lex

    /**
     * Номер строки
     */
    get sourceLine():number|undefined {
        if( this.begin instanceof SourceLineBeginLex ){
            return this.begin.line
        }
        return undefined
    }
}
