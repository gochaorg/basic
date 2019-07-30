import { Statement } from './Statement'
import { Lex } from './Lexer'

export class Statements extends Statement {
    readonly kind:string
    readonly begin:Lex
    readonly end:Lex
    readonly statements:ReadonlyArray<Statement>
    constructor( begin:Lex, end:Lex, statements:Statement[] ){
        super()
        this.kind = "Statements"
        this.begin = begin
        this.end = end
        this.statements = statements
    }
}
