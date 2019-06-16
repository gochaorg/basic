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
    Statements ;