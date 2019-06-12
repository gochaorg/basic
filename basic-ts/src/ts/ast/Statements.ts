import { Statement, SourceStatement, ImmediateStatement } from './Statement'
import { Lex } from './Lexer'

export class AStatements implements Statement {
    readonly begin:Lex
    readonly end:Lex
    readonly statements:ReadonlyArray<Statement>
    constructor( begin:Lex, end:Lex, statements:Statement[] ){
        this.begin = begin
        this.end = end
        this.statements = statements
    }
}

export class SStatements extends AStatements implements SourceStatement {
}

export class IStatements extends AStatements implements ImmediateStatement {
}