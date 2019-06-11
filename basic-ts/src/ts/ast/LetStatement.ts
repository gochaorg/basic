import { Statement, SourceStatement, ImmediateStatement } from './Statement'
import { Lex, RemLex, SourceLineBeginLex, IDLex } from './Lexer'
import { Expression } from './OperatorExp';

export class ALetStatement {
    readonly begin:Lex
    readonly end:Lex
    readonly let?:Lex
    readonly variable:IDLex
    readonly value:Expression
    readonly kind:string
    constructor(begin:Lex, end:Lex, variable:IDLex, value:Expression){
        this.begin = begin
        this.end = end
        this.variable = variable
        this.value = value
        this.kind = 'Let'
    }
}

export class ILetStatement extends ALetStatement implements ImmediateStatement {    
}

export class SLetStatement extends ALetStatement implements SourceStatement {    
}