import { Statement } from './Statement'
import { Lex, RemLex, SourceLineBeginLex } from './Lexer'

export class RemStatement extends Statement {
    readonly begin:Lex
    readonly end:Lex
    readonly rem:RemLex
    readonly kind:string
    constructor( begin:Lex, end:Lex, rem:RemLex ){
        super()
        this.begin = begin
        this.end = end
        this.rem = rem
        this.kind = 'Rem'
    }
}
