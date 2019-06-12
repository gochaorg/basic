import { SourceUnit } from "./SourceUnit";
import { Statement } from "../ast/Statement";
import { LetStatement } from "../ast/LetStatement";
import { Expression, BinaryOpExpression, LiteralExpression, VarRefExpression, UnaryOpExpression } from "../ast/OperatorExp";
import { Memo } from "./Memo";

export class BasicVm {
    source: SourceUnit
    memo: Memo
    constructor( source:SourceUnit, memo?:Memo ){
        this.source = source
        if( memo ){
            this.memo = memo
        }else{
            this.memo = new Memo()
        }
    }

    evaluate( exp:Expression ):any {
        if( exp instanceof LiteralExpression ){
            return exp.value
        }
        if( exp instanceof VarRefExpression ){
            return this.memo.read( exp.id.id )
        }
        if( exp instanceof UnaryOpExpression ){
            switch( exp.operator.keyWord.toLowerCase() ){
                case '-': return (0-this.evaluate(exp.base))
                case '+': return this.evaluate(exp.base)
                case 'not': return !this.evaluate(exp.base)
                default:
                    throw new Error(`undefined unary operator ${exp.operator.keyWord}`)
            }
        }
        if( exp instanceof BinaryOpExpression ){
            switch( exp.operator.keyWord.toLowerCase() ){
                case '+': return ( this.evaluate(exp.left) + this.evaluate(exp.right) )
                case '-': return ( this.evaluate(exp.left) - this.evaluate(exp.right) )
                case '*': return ( this.evaluate(exp.left) * this.evaluate(exp.right) )
                case '/': return ( this.evaluate(exp.left) / this.evaluate(exp.right) )
                default:
                    throw new Error(`undefined binary operator ${exp.operator.keyWord}`)
            }
        }
        return undefined
    }
}