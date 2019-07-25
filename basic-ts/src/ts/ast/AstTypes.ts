import { 
    LiteralExpression, 
    VarRefExpression, 
    UnaryOpExpression, 
    BinaryOpExpression, 
    Expression 
} from './OperatorExp';
import { LetStatement } from './LetStatement';
import { RemStatement } from './RemStatement';
import { RunStatement } from './RunStatement';
import { Statements } from './Statements';
import { Statement } from './Statement';
import { IfStatement } from './IfStatement';
import { GotoStatement } from './GotoStatement';
import { GoSubStatement } from './GoSubStatement';
import { ReturnStatement } from './ReturnStatement';
import { PrintStatement } from './PrintStatement';

/**
 * Тип объектов в AST
 */
export type ValidAstType = 
    LiteralExpression | 
    VarRefExpression | 
    UnaryOpExpression | 
    BinaryOpExpression |
    Expression |
    Statement |
    LetStatement |
    RemStatement |
    RunStatement |
    IfStatement |
    GotoStatement |
    GoSubStatement |
    ReturnStatement |
    PrintStatement |
    Statements ;