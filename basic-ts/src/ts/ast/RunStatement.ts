import { Statement, SourceStatement, ImmediateStatement } from './Statement'
import { Lex, RemLex, SourceLineBeginLex, IDLex, NumberLex } from './Lexer'

export class ARunStatement {
    readonly begin:Lex
    readonly end:Lex
    readonly line?:NumberLex
    readonly kind:string
    constructor(begin:Lex, end:Lex, line?:NumberLex){
        this.begin = begin
        this.end = end
        this.line = line
        this.kind = 'Run'
    }
}

export class IRunStatement extends ARunStatement implements ImmediateStatement {}
export class SRunStatement extends ARunStatement implements SourceStatement {}