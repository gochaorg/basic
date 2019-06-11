import { Statement, SourceStatement, ImmediateStatement } from './Statement'
import { Lex, RemLex, SourceLineBeginLex } from './Lexer'

export class ARemStatement implements Statement {
    readonly begin:Lex
    readonly end:Lex
    readonly rem:RemLex
    readonly kind:string
    constructor( begin:Lex, end:Lex, rem:RemLex ){
        this.begin = begin
        this.end = end
        this.rem = rem
        this.kind = 'Rem'
    }
}

export class SRemStatement extends ARemStatement implements SourceStatement {
}

export class IRemStatement extends ARemStatement implements ImmediateStatement {
}
