import {
    Lex, OperatorLex, IDLex
} from './Lexer'

export interface Expression {
}

export class ConstExpression implements Expression {
    readonly lex:Lex
    readonly value:any
    constructor(lex:Lex, value:any) {
        this.lex = lex
        this.value = value
    }
}

export class VarRefExpression implements Expression {
    readonly lex:IDLex
    constructor(lex:IDLex) {
        this.lex = lex
    }
}

export class BinaryOpExpression {
    readonly operator:OperatorLex
    readonly left:Expression
    readonly right:Expression
    constructor(op:OperatorLex, left:Expression, right:Expression){
        this.operator = op
        this.left = left
        this.right = right
    }
}

export class UnaryOpExpression {
    readonly operator:OperatorLex
    readonly base:Expression
    constructor(op:OperatorLex, base:Expression){
        this.operator = op
        this.base = base
    }
}
