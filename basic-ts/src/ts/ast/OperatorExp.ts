import {
    Lex, OperatorLex, IDLex
} from './Lexer'
import { TreeIt, TreeStep } from '../TreeIt';

/**
 * Описывает некое мат-выражение
 */
export interface Expression {
    /**
     * Описвыает список лексем на этом уровне узла-дерева
     */
    readonly lexems:Lex[]

    /**
     * Описывает дочерние (поддеревья) мат выражения
     */
    readonly children:Expression[]

    /**
     * Описывает саму первую лексему в (под)дереве
     */
    leftTreeLex:Lex|undefined

    /**
     * Описывает саму последнюю лексему в (под)дереве
     */
    rightTreeLex:Lex|undefined
}

export abstract class AExpression implements Expression {
    abstract lexems: Lex[]
    abstract children: Expression[]

    get treeList():TreeStep<Expression>[] {
        return TreeIt.list( this as Expression, (n) => n.children )
    }

    get treeLexList():Lex[] {
        const arr:Lex[] = []
        this.treeList.forEach( exp => {
            exp.value.lexems.forEach( lx=>arr.push(lx) )
        })
        return arr
    }

    get leftTreeLex():Lex|undefined {
        const lxs = this.treeLexList
        if( lxs.length<1 )return undefined
        if( lxs.length==1 )return lxs[0]
        return lxs.reduce( (a,b)=>a.begin > b.begin ? b : a )
    }

    get rightTreeLex():Lex|undefined {
        const lxs = this.treeLexList
        if( lxs.length<1 )return undefined
        if( lxs.length==1 )return lxs[0]
        return lxs.reduce( (a,b)=>a.begin > b.begin ? a : b )
    }
}

/**
 * Константное значение (Литерал - строка/число/и т.д...)
 */
export class ConstExpression extends AExpression implements Expression {
    readonly lex:Lex
    readonly value:any
    readonly lexems:Lex[]
    readonly children:Expression[]
    readonly kind:string
    constructor(lex:Lex, value:any) {
        super()
        this.lex = lex
        this.value = value
        this.lexems = [ lex ]
        this.children = []
        this.kind = 'Literal'
    }
}

/**
 * Ссылка на переменную
 */
export class VarRefExpression extends AExpression implements Expression {
    readonly lex:IDLex
    readonly lexems:Lex[]
    readonly children:Expression[]
    readonly kind:string
    constructor(lex:IDLex) {
        super()
        this.lex = lex
        this.lexems = [ lex ]
        this.children = []
        this.kind = 'VarRef'
    }
}

/**
 * Бинарная операция
 */
export class BinaryOpExpression extends AExpression {
    readonly operator:OperatorLex
    readonly left:Expression
    readonly right:Expression
    readonly lexems:Lex[]
    readonly children:Expression[]
    readonly kind:string
    constructor(op:OperatorLex, left:Expression, right:Expression){
        super()
        this.operator = op
        this.left = left
        this.right = right
        this.lexems = [ op ]
        this.children = [ left, right ]
        this.kind = 'BinaryOperator'
    }
}

/**
 * Унраная операция
 */
export class UnaryOpExpression extends AExpression {
    readonly operator:OperatorLex
    readonly base:Expression
    readonly lexems:Lex[]
    readonly children:Expression[]
    readonly kind:string
    constructor(op:OperatorLex, base:Expression){
        super()
        this.operator = op
        this.base = base
        this.lexems = [ op ]
        this.children = [ base ]
        this.kind = 'UnaryOperator'
    }
}
