import { Statement } from './Statement'
import { Lex, RemLex, SourceLineBeginLex, IDLex, NumberLex } from './Lexer'
import { Expression } from './OperatorExp';

export class IfStatement extends Statement {
    readonly kind:string
    readonly begin:Lex
    readonly end:Lex
    readonly boolExp:Expression
    readonly trueStatement:Statement
    readonly falseStatement?:Statement
    constructor(begin:Lex, end:Lex, boolExp:Expression, trueStatement:Statement, falseStatement?:Statement){
        super()
        this.kind = 'If'
        this.begin = begin
        this.end = end
        this.boolExp = boolExp
        this.trueStatement = trueStatement
        this.falseStatement = falseStatement
    }
}