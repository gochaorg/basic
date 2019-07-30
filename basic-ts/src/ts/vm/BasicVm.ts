import { SourceUnit } from "./SourceUnit";
import { Statement } from "../ast/Statement";
import { LetStatement } from "../ast/LetStatement";
import { Expression, BinaryOpExpression, LiteralExpression, VarRefExpression, UnaryOpExpression, VarArrIndexRef } from "../ast/OperatorExp";
import { Memo } from "./Memo";
import { asInt } from "../common/Num";
import { RemStatement } from "../ast/RemStatement";
import { RunStatement } from "../ast/RunStatement";
import { GotoStatement } from "../ast/GotoStatement";
import { IfStatement } from "../ast/IfStatement";
import { GoSubStatement } from "../ast/GoSubStatement";
import { ReturnStatement } from "../ast/ReturnStatement";
import { PrintStatement } from "../ast/PrintStatement";
import { Printer,printers } from "./Printer";
import { CallStatement } from "../ast/CallStatement";
import { Fun, CallCtx } from "./ExtFun";

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
        if( exp instanceof VarArrIndexRef ){
            const varInst = this.memo.read( exp.varname )
            if( varInst==undefined ){
                throw new Error("undefined variable "+exp.varname)
            }
            if( varInst instanceof Fun ){
                const ctx = new CallCtx(this,exp)
                const fn = varInst
                const args = exp.indexes.map( e => this.evalExpression(e) )
                return fn.apply(ctx, args)
            }
            const res = this.memo.read( exp.varname, exp.indexes )
            return res
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
            if( exp.operator.idiv ) return asInt( this.evalExpression(exp.left) / asInt(this.evalExpression(exp.right)) )            
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

    //#region Printing
    private get defaultPrinter() {
        return printers.console.clone().configure(c => {
            c.prefix = "BASIC> "
        })
    }
    private _printer:Printer = this.defaultPrinter
    get printer():Printer { return this._printer }
    set printer(x:Printer) {
        if( x ){
            this._printer = x
        }else{
            this._printer = this.defaultPrinter
        }
    }
    
    private print(v:any){
        this.printer.print(v)
    }
    private println(){
        this.printer.println()
    }
    //#endregion

    private callProcudure(name:string, args:any[], callst:CallStatement){
        const fnInst = this.memo.read(name)
        if( typeof(fnInst)=='object' && fnInst instanceof Fun ){
            const fn = fnInst as Fun
            const ctx = new CallCtx(this, callst)            
            fn.apply(ctx, args)
        }else if( typeof(fnInst)=='function' ){
            const fn = fnInst as Function
            fn.apply( {}, args )
        }else{
            throw new Error(`can't call procedure ${name}, procedure not found`)
        }
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
        if( st instanceof GotoStatement ){
            const found = this.source.find(st.gotoLine.value)
            if( found ){
                this.ip = found.index
            }else{
                throw new Error(`source line ${st.gotoLine.value} not found`)
            }
            return
        }
        if( st instanceof GoSubStatement ){
            const found = this.source.find(st.gotoLine.value)
            if( found ){
                //console.log("gosub ",found)
                this.ipStack.push(this.ip)
                this.ip = found.index
            }else{
                throw new Error(`source line ${st.gotoLine.value} not found`)
            }
        }
        if( st instanceof ReturnStatement ){
            if( st.gotoLine ){
                const found = this.source.find(st.gotoLine.value)
                if( found ){
                    this.ipStack.pop()
                    this.ip = found.index
                }else{
                    throw new Error(`source line ${st.gotoLine.value} not found`)
                }
            }else{
                if( this.ipStack.length>0 ){
                    const targetIp = this.ipStack.pop()
                    if( targetIp!==undefined ){
                        this.ip = targetIp+1
                    }else{
                        throw new Error(`gosub stack return undefined`)
                    }
                }else{
                    throw new Error(`gosub stack is empty`)
                }
            }
        }
        if( st instanceof IfStatement ){
            const bval = this.evalExpression( st.boolExp )
            if( bval ){
                this.evalStatement( st.trueStatement )
            }else if( st.falseStatement ){
                this.evalStatement( st.falseStatement )
            }
        }
        if( st instanceof PrintStatement ){
            st.args.forEach( (exp)=>{
                const v = this.evalExpression(exp)
                this.print(v)
            })
            this.println()
        }
        if( st instanceof CallStatement ){
            const callArgs:any[] = []
            st.args.forEach( (exp)=>{
                const v = this.evalExpression(exp)
                callArgs.push(v)
            })
            this.callProcudure(st.name.id,callArgs, st)
        }
    }

    /**
     * Стек вызовов GoSub
     */
    ipStack:number[] = []

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

        return true
    }
}