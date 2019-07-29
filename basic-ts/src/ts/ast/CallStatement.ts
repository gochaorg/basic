import { Statement } from './Statement'
import { Lex, StatementLex, SourceLineBeginLex, IDLex } from './Lexer'
import { Expression } from './OperatorExp';

export class CallStatement extends Statement {
    readonly begin:Lex
    readonly end:Lex
    readonly call:StatementLex
    readonly name:IDLex
    readonly args:Expression[]
    readonly kind:string
    constructor( begin:Lex, end:Lex, call:StatementLex, name:IDLex, args:Expression[] ){
        super()
        this.begin = begin
        this.end = end
        this.call = call
        this.name = name
        this.args = args
        this.kind = 'Call'
    }
}
