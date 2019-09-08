import { Statement } from './Statement'
import { Lex, RemLex, SourceLineBeginLex, IDLex } from './Lexer'
import { Expression } from './OperatorExp';

export class LetStatement extends Statement {
    readonly kind:string
    readonly begin:Lex
    readonly end:Lex
    readonly let?:Lex
    readonly variable:IDLex
    readonly value:Expression
    constructor(begin:Lex, end:Lex, variable:IDLex, value:Expression){
        super()
        this.kind = 'Let'
        this.begin = begin
        this.end = end
        this.variable = variable
        this.value = value
    }
    get varname(){ return this.variable.id }
}
