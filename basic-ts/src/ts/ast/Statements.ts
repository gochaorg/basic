import { Statement } from './Statement'
import { Lex } from './Lexer'

export class AStatements extends Statement {
    readonly begin:Lex
    readonly end:Lex
    readonly statements:ReadonlyArray<Statement>
    constructor( begin:Lex, end:Lex, statements:Statement[] ){
        super()
        this.begin = begin
        this.end = end
        this.statements = statements
    }
}
