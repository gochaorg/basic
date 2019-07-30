import { Statement } from './Statement'
import { Lex, StatementLex, SourceLineBeginLex } from './Lexer'
import { Expression } from './OperatorExp';

export class PrintStatement extends Statement {
    readonly kind:string
    readonly begin:Lex
    readonly end:Lex
    readonly print:StatementLex
    readonly args:Expression[]
    constructor( begin:Lex, end:Lex, print:StatementLex,args:Expression[] ){
        super()
        this.kind = 'Print'
        this.begin = begin
        this.end = end
        this.print = print
        this.args = args
    }
}
