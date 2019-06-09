import {
    Lex, OperatorLex, IDLex
} from './Lexer'
import { TreeIt } from '../TreeIterator';

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
}

export abstract class AExpression implements Expression {
    abstract lexems: Lex[]
    abstract children: Expression[]

    /**
     * Обход всех дочерних узлов включая себя
     * @param f функция приемник
     */
    each(f:(e:Expression)=>any) {
        TreeIt.each<Expression>(this,(n)=>n.children, (n)=>{
            f(n)
        })
    }

    minMaxLex(){
        let minl : Lex | null = null
        let maxl : Lex | null = null
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
    constructor(lex:Lex, value:any) {
        super()
        this.lex = lex
        this.value = value
        this.lexems = [ lex ]
        this.children = []
    }
}

/**
 * Ссылка на переменную
 */
export class VarRefExpression extends AExpression implements Expression {
    readonly lex:IDLex
    readonly lexems:Lex[]
    readonly children:Expression[]
    constructor(lex:IDLex) {
        super()
        this.lex = lex
        this.lexems = [ lex ]
        this.children = []
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
    constructor(op:OperatorLex, left:Expression, right:Expression){
        super()
        this.operator = op
        this.left = left
        this.right = right
        this.lexems = [ op ]
        this.children = [ left, right ]
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
    constructor(op:OperatorLex, base:Expression){
        super()
        this.operator = op
        this.base = base
        this.lexems = [ op ]
        this.children = [ base ]
    }
}
