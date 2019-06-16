import { Statement } from './Statement'
import { Lex, RemLex, SourceLineBeginLex, IDLex, NumberLex } from './Lexer'

export class RunStatement extends Statement {
    readonly begin:Lex
    readonly end:Lex
    readonly runLine?:NumberLex
    readonly kind:string
    constructor(begin:Lex, end:Lex, line?:NumberLex){
        super()
        this.begin = begin
        this.end = end
        this.runLine = line
        this.kind = 'Run'
    }
}
