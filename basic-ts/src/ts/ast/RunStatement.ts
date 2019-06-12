import { Statement } from './Statement'
import { Lex, RemLex, SourceLineBeginLex, IDLex, NumberLex } from './Lexer'

export class ARunStatement extends Statement {
    readonly begin:Lex
    readonly end:Lex
    readonly line?:NumberLex
    readonly kind:string
    constructor(begin:Lex, end:Lex, line?:NumberLex){
        super()
        this.begin = begin
        this.end = end
        this.line = line
        this.kind = 'Run'
    }
}
