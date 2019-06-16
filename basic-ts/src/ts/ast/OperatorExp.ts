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
    readonly lexems:ReadonlyArray<Lex>

    /**
     * Описывает дочерние (поддеревья) мат выражения
     */
    readonly children:ReadonlyArray<Expression>

    /**
     * Описывает саму первую лексему в (под)дереве
     */
    leftTreeLex:Lex|undefined

    /**
     * Описывает саму последнюю лексему в (под)дереве
     */
    rightTreeLex:Lex|undefined

    /**
     * Размер поддерева, т.е. кол-во узлов включая всех вложенных
     */
    treeSize:number
}

export abstract class AExpression implements Expression {
    abstract lexems: ReadonlyArray<Lex>
    abstract children: ReadonlyArray<Expression>

    private treeSizeValue:number|undefined
    get treeSize():number {
        if( this.treeSizeValue!==undefined )return this.treeSizeValue
        this.treeSizeValue = this.treeList.length
        return this.treeSizeValue
    }

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
export class LiteralExpression extends AExpression implements Expression {
    readonly lex:Lex
    readonly value:any
    readonly lexems:ReadonlyArray<Lex>
    readonly children:ReadonlyArray<Expression>
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
    readonly id:IDLex
    readonly lexems:ReadonlyArray<Lex>
    readonly children:ReadonlyArray<Expression>
    readonly kind:string
    constructor(lex:IDLex) {
        super()
        this.id = lex
        this.lexems = [ lex ]
        this.children = []
        this.kind = 'VarRef'
    }
    get varname() { return this.id.id }
}

/**
 * Бинарная операция
 */
export class BinaryOpExpression extends AExpression {
    readonly operator:OperatorLex
    readonly left:Expression
    readonly right:Expression
    readonly lexems:ReadonlyArray<Lex>
    readonly children:ReadonlyArray<Expression>
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
    readonly lexems:ReadonlyArray<Lex>
    readonly children:ReadonlyArray<Expression>
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
