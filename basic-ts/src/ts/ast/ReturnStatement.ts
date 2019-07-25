import { Statement } from './Statement'
import { Lex, RemLex, SourceLineBeginLex, IDLex, NumberLex } from './Lexer'
import { Expression } from './OperatorExp';

export class ReturnStatement extends Statement {
    readonly begin:Lex
    readonly end:Lex
    readonly gotoLine?:NumberLex
    readonly kind:string
    constructor(begin:Lex, end:Lex, line?:NumberLex){
        super()
        this.begin = begin
        this.end = end
        this.gotoLine = line
        this.kind = 'Return'
    }
}