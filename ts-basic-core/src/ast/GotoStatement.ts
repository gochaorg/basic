import { Statement } from './Statement'
import { Lex, RemLex, SourceLineBeginLex, IDLex, NumberLex } from './Lexer'
import { Expression } from './OperatorExp';

export class GotoStatement extends Statement {
    readonly kind:string
    readonly begin:Lex
    readonly end:Lex
    readonly gotoLine:NumberLex
    constructor(begin:Lex, end:Lex, line:NumberLex){
        super()
        this.kind = 'Goto'
        this.begin = begin
        this.end = end
        this.gotoLine = line
    }
}