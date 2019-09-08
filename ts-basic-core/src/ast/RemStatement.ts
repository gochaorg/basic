import { Statement } from './Statement'
import { Lex, RemLex, SourceLineBeginLex } from './Lexer'

export class RemStatement extends Statement {
    readonly kind:string
    readonly begin:Lex
    readonly end:Lex
    readonly rem:RemLex
    constructor( begin:Lex, end:Lex, rem:RemLex ){
        super()
        this.kind = 'Rem'
        this.begin = begin
        this.end = end
        this.rem = rem
    }
}
