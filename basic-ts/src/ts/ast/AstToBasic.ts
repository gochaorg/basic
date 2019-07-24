import * as Ast from './AstVisitor'
import { ValidAstType } from './AstTypes'
import { LiteralExpression, VarRefExpression, UnaryOpExpression, BinaryOpExpression, Expression, VarArrIndexRef } from './OperatorExp';
import { LetStatement } from './LetStatement';
import { RemStatement } from './RemStatement';
import { RunStatement } from './RunStatement';
import { Statements } from './Statements';
import { Statement } from './Statement';
import { SourceUnit } from '../vm/SourceUnit';
import { GotoStatement } from './GotoStatement';
import { IfStatement } from './IfStatement';

/**
 * Генератор из AST в BASIC
 */
export function astToBasic( 
        root:ValidAstType|SourceUnit, 
        opts?:{
            sourceLineNumber?:boolean
        }
):string{
    if( opts==undefined ){
        opts = {
            sourceLineNumber:true
        }
    }
    if( root==undefined ) return ""
    if( root==null ) return ""
    //#region LiteralExpression
    if( root instanceof LiteralExpression ){
        if( typeof(root.value)=='number' ){
            return ''+root.value
        }else if( typeof(root.value)=='boolean' ){
            if( root.value ){
                return '1<2'
            }else{
                return '1>2'
            }
        }else if( typeof(root.value)=='string' ){
            const sval = root.value as string
            let str = "\""
            for( let i=0; i<sval.length; i++){
                let ch = str[i]
                if( ch=='"' ){
                    str += "encode_dquote"
                }else if( ch=="'" ){
                    str += "encode_quote"
                }else if( ch=="\n" ){
                    str += "encode_nl"
                }else if( ch=="\r" ){
                    str += "encode_cr"
                }else if( ch=="\t" ){
                    str += "encode_tab"
                }else if( ch.charCodeAt(0)>31 ){
                    str += ch
                }
            }
            str += "\""
            return str
        }else{
            throw new Error(`unknow Literal value type = ${typeof(root.value)}`)
        }
    }
    //#endregion
    //#region var ref
    if( root instanceof VarArrIndexRef ){
        let code = ''
        code += root.varname 
        code += '('
        let idx = -1
        for( let aidx of root.indexes ){
            idx++
            if( idx>0 ) code += ','
            code += astToBasic(aidx, opts)
        }
        code += ')'
        return code
    }
    //#endregion
    //#region var ref
    if( root instanceof VarRefExpression ){
        return root.varname
    }
    //#endregion
    //#region unary ref
    if( root instanceof UnaryOpExpression ){
        return root.operator.keyWord + '(' + astToBasic(root.base,opts) + ')'
    }
    //#endregion
    //#region BinaryOpExpression
    if( root instanceof BinaryOpExpression ){
        let code = ''
        
        if( root.left.treeSize>1 ){            
            code += '(' + astToBasic(root.left,opts) + ')'
        }else{
            code += astToBasic(root.left,opts)
        }

        code += root.operator.keyWord

        if( root.right.treeSize>1 ){            
            code += '(' + astToBasic(root.right,opts) + ')'
        }else{
            code += astToBasic(root.right,opts)
        }

        return code
    }
    //#endregion
    //#region LET
    if( root instanceof LetStatement ){
        let code = ''
        if( root.sourceLine!=undefined && opts.sourceLineNumber ){
            code = `${root.sourceLine} `
        }
        code += `LET ${root.varname} = ${astToBasic(root.value,opts)}`
        return code
    }
    //#endregion
    //#region REM
    if( root instanceof RemStatement ){
        let code = ''
        if( root.sourceLine!=undefined && opts.sourceLineNumber ){
            code = `${root.sourceLine} `
        }
        code += `REM ${root.rem.comment}`
        return code
    }
    //#endregion
    //#region RUN
    if( root instanceof RunStatement ){
        let code = ''
        if( root.sourceLine!=undefined && opts.sourceLineNumber ){
            code = `${root.sourceLine} `
        }
        code += "RUN"
        if( root.runLine != undefined ){
            code += ` ${root.runLine}`
        }
        return code
    }
    //#endregion
    //#region GOTO
    if( root instanceof GotoStatement ){
        let code = ''
        if( root.sourceLine!=undefined && opts.sourceLineNumber ){
            code = `${root.sourceLine} `
        }
        code += "GOTO"
        if( root.gotoLine != undefined ){
            code += ` ${root.gotoLine.value}`
        }
        return code
    }
    //#endregion
    //#region IF
    if( root instanceof IfStatement ){
        let code = ''
        if( root.sourceLine!=undefined && opts.sourceLineNumber ){
            code = `${root.sourceLine} `
        }
        code += "IF "
        code += astToBasic(root.boolExp, opts)
        code += " THEN "
        code += astToBasic(root.trueStatement, {sourceLineNumber:false})
        if( root.falseStatement ){
            code += " ELSE "
            code += astToBasic(root.falseStatement, {sourceLineNumber:false})
        }
        return code
    }
    //#endregion
    //#region Statements
    if( root instanceof Statements ){
        let code = ''
        root.statements.forEach( st => {
            if( code.length>0 ){
                code += "\n"
            }
            code += astToBasic(st,opts)
        })
        return code
    }
    //#endregion
    //#region SourceUnit
    if( root instanceof SourceUnit ){
        let code = ''
        root.lines.forEach( line => {
            if( code.length>0 ){
                code += "\n"
            }
            code += astToBasic( line.statement,opts )
        });
        return code
    }
    //#endregion
    throw new Error("unknow argument type "+root+":"+Object.getPrototypeOf(root))
}