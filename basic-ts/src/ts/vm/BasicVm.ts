import { SourceUnit } from "./SourceUnit";
import { Statement } from "../ast/Statement";
import { LetStatement } from "../ast/LetStatement";
import { Expression, BinaryOpExpression, LiteralExpression, VarRefExpression, UnaryOpExpression } from "../ast/OperatorExp";
import { Memo } from "./Memo";
import { asInt } from "../Num";
import { RemStatement } from "../ast/RemStatement";
import { RunStatement } from "../ast/RunStatement";

export class BasicVm {    
    /**
     * Набор исходников для исполнения
     */
    readonly source: SourceUnit

    /**
     * Память
     */
    readonly memo: Memo

    constructor( source:SourceUnit, memo?:Memo ){
        this.source = source
        if( memo ){
            this.memo = memo
        }else{
            this.memo = new Memo()
        }
    }

    /**
     * Вычисляет выражение (expression)
     * @param exp выражение 
     */
    evalExpression( exp:Expression ):any {
        if( exp instanceof LiteralExpression ){
            return exp.value
        }
        if( exp instanceof VarRefExpression ){
            const res = this.memo.read( exp.varname )
            if( res == undefined )throw new Error("undefined variable "+exp.varname)
            return res
        }
        if( exp instanceof UnaryOpExpression ){
            if( exp.operator.minus ) return (0-this.evalExpression(exp.base))
            if( exp.operator.plus ) return this.evalExpression(exp.base)
            if( exp.operator.not ) return !this.evalExpression(exp.base)

            throw new Error(`undefined unary operator ${exp.operator.keyWord}`)
        }
        if( exp instanceof BinaryOpExpression ){
            //#region math
            if( exp.operator.plus ) return ( this.evalExpression(exp.left) + this.evalExpression(exp.right) )
            if( exp.operator.minus ) return ( this.evalExpression(exp.left) - this.evalExpression(exp.right) )
            if( exp.operator.mult ) return ( this.evalExpression(exp.left) * this.evalExpression(exp.right) )
            if( exp.operator.div ) return ( this.evalExpression(exp.left) / this.evalExpression(exp.right) )
            if( exp.operator.idiv ) return asInt( this.evalExpression(exp.left) / this.evalExpression(exp.right) )            
            if( exp.operator.mod ) return asInt( this.evalExpression(exp.left) % this.evalExpression(exp.right) )
            //#endregion
            //#region logic
            if( exp.operator.and ) return this.evalExpression(exp.left) && this.evalExpression(exp.right)
            if( exp.operator.or ) return this.evalExpression(exp.left) || this.evalExpression(exp.right)

            // TODO check type
            if( exp.operator.xor ) return !(this.evalExpression(exp.left) == this.evalExpression(exp.right))

            // TODO check type
            if( exp.operator.eqv ) return this.evalExpression(exp.left) == this.evalExpression(exp.right)

            if( exp.operator.imp ){
                const l = this.evalExpression(exp.left)
                const r = this.evalExpression(exp.right)
                if( l ){
                    if( r ){
                        return true
                    }else {
                        return false
                    }
                }else{
                    return true
                }
            }
            //#endregion
            //#region compare
            if( exp.operator.equals ){
                return this.evalExpression(exp.left) == this.evalExpression(exp.right)
            }
            if( exp.operator.notEquals ){
                return this.evalExpression(exp.left) != this.evalExpression(exp.right)
            }
            if( exp.operator.less ){
                return this.evalExpression(exp.left) < this.evalExpression(exp.right)
            }
            if( exp.operator.lesOrEquals ){
                return this.evalExpression(exp.left) <= this.evalExpression(exp.right)
            }
            if( exp.operator.more ){
                return this.evalExpression(exp.left) > this.evalExpression(exp.right)
            }
            if( exp.operator.moreOrEquals ){
                return this.evalExpression(exp.left) >= this.evalExpression(exp.right)
            }
            //#endregion

            throw new Error(`undefined binary operator ${exp.operator.keyWord}`)
        }
        throw new Error("undefined expression "+exp)
    }

    /**
     * Выполняет выражение (statement)
     * @param st выражение
     */
    evalStatement( st:Statement ){
        if( st instanceof RemStatement ){
            return
        }
        if( st instanceof LetStatement ){
            const val = this.evalExpression( st.value )
            this.memo.write( st.varname, val )
            return
        }
        if( st instanceof RunStatement ){
            return
        }
    }

    /**
     * Регистр IP (Instruction Pointer)
     */
    ip:number = -1

    /**
     * Проверяет есть ли еще инструкции для выполнения
     * @returns true - есть инструкции для выполенения
     */
    hasNext() {
        if( this.ip<0 )return false
        if( this.ip>=this.source.lines.length )return false
        return true
    }

    /**
     * Выполняет очередную инструкцию
     * @returns true - инструкция выполнена / false - инструкция не была выполнена ибо конец
     */
    next(){
        if( !this.hasNext() )return false

        const st = this.source.lines[this.ip]
        if( st==undefined || st==null )return false

        const beforeIp = this.ip        
        this.evalStatement( st.statement )

        const afterIp = this.ip
        if( afterIp==beforeIp ){
            this.ip++
        }

        return false
    }
}