import { Statement } from './Statement'
import { Lex, StatementLex, SourceLineBeginLex } from './Lexer'
import { Expression } from './OperatorExp';

export class PrintStatement extends Statement {
    readonly begin:Lex
    readonly end:Lex
    readonly print:StatementLex
    readonly args:Expression[]
    readonly kind:string
    constructor( begin:Lex, end:Lex, print:StatementLex,args:Expression[] ){
        super()
        this.begin = begin
        this.end = end
        this.print = print
        this.args = args
        this.kind = 'Print'
    }
}
