/**
 * Обход Ast дерева
 */

import { Statement } from "./Statement";
import { ARemStatement } from "./RemStatement";
import { SStatements, AStatements } from "./Statements";
import { ALetStatement } from "./LetStatement";
import { ARunStatement } from "./RunStatement";
import { BinaryOpExpression, UnaryOpExpression, LiteralExpression, VarRefExpression } from "./OperatorExp";
import { TreeStep } from "../TreeIt";

export class AstTreeStep extends TreeStep<any> {    
}

export interface AstBeginEnd<T> {
    begin?( v:T, path?:AstTreeStep ):any
    end?( v:T, path?:AstTreeStep ):any
}

export interface AstVisitor {
    statements?: AstBeginEnd<AStatements>
    rem?: AstBeginEnd<ARemStatement>
    let?: AstBeginEnd<ALetStatement>
    run?: AstBeginEnd<ARunStatement>
    operator?: {
        binary?: AstBeginEnd<BinaryOpExpression>
        unary?: AstBeginEnd<UnaryOpExpression>
        literal?: AstBeginEnd<LiteralExpression>
        varRef?: AstBeginEnd<VarRefExpression>
    }
}

export function walk( ts:AstTreeStep, visitor:AstVisitor ){
    //#region check args
    if( visitor==undefined || visitor==null ) {
        throw new Error("illegal argument visitor")
    }

    if( ts==undefined || ts==null ){
        throw new Error("illegal argument path")
    }
    //#endregion

    //#region AStatements
    if( ts.value instanceof AStatements ){
        if( visitor.statements && visitor.statements.begin ){
            visitor.statements.begin( ts.value, ts )
        }
        for( let st of ts.value.statements ){
            walk(ts.follow(st), visitor)
        }
        if( visitor.statements && visitor.statements.end ){
            visitor.statements.end( ts.value, ts )
        }
    }
    //#endregion
    //#region ARemStatement
    if( ts.value instanceof ARemStatement ){
        if( visitor.rem && visitor.rem.begin ){
            visitor.rem.begin( ts.value, ts )
        }        
        if( visitor.rem && visitor.rem.end ){
            visitor.rem.end( ts.value, ts )
        }
    }
    //#endregion
    //#region ALetStatement
    if( ts.value instanceof ALetStatement ){        
        if( visitor.let && visitor.let.begin ){
            visitor.let.begin( ts.value, ts )
        }
        walk( ts.follow( ts.value.value ), visitor )
        if( visitor.let && visitor.let.end ){
            visitor.let.end( ts.value, ts )
        }
    }
    //#endregion
    //#region ARunStatement
    if( ts.value instanceof ARunStatement ){
        if( visitor.run && visitor.run.begin ){
            visitor.run.begin( ts.value, ts )
        }
        if( visitor.run && visitor.run.end ){
            visitor.run.end( ts.value, ts )
        }
    }
    //#endregion
    //#region BinaryOpExpression
    if( ts.value instanceof BinaryOpExpression ){
        if( visitor.operator && visitor.operator.binary && visitor.operator.binary.begin ){
            visitor.operator.binary.begin( ts.value, ts )
        }
        if( ts.value.left ){
            walk( ts.follow(ts.value.left), visitor )
        }
        if( ts.value.right ){
            walk( ts.follow(ts.value.right), visitor )
        }
        if( visitor.operator && visitor.operator.binary && visitor.operator.binary.end ){
            visitor.operator.binary.end( ts.value, ts )
        }
    }
    //#endregion
    //#region UnaryOpExpression
    if( ts.value instanceof UnaryOpExpression ){
        if( visitor.operator && visitor.operator.unary && visitor.operator.unary.begin ){
            visitor.operator.unary.begin( ts.value, ts )
        }
        if( ts.value.base ){
            walk( ts.follow( ts.value.base ), visitor )
        }
        if( visitor.operator && visitor.operator.unary && visitor.operator.unary.end ){
            visitor.operator.unary.end( ts.value, ts )
        }
    }
    //#endregion
    //#region LiteralExpression
    if( ts.value instanceof LiteralExpression ){
        if( visitor.operator && visitor.operator.literal && visitor.operator.literal.begin ){
            visitor.operator.literal.begin( ts.value, ts )
        }
        if( visitor.operator && visitor.operator.literal && visitor.operator.literal.end ){
            visitor.operator.literal.end( ts.value, ts )
        }
    }
    //#endregion
    //#region VarRefExpression
    if( ts.value instanceof VarRefExpression ){
        if( visitor.operator && visitor.operator.varRef && visitor.operator.varRef.begin ){
            visitor.operator.varRef.begin( ts.value, ts )
        }
        if( visitor.operator && visitor.operator.varRef && visitor.operator.varRef.end ){
            visitor.operator.varRef.end( ts.value, ts )
        }
    }
    //#endregion
}

export function visit( root:any, visitor:AstVisitor ){
    if( visitor==undefined || visitor==null ) {
        throw new Error("illegal argument visitor")
    }
    walk(new TreeStep<any>(root), visitor)
}
