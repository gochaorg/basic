import { Pointer } from './Pointer';
import { 
    Lex, parseBasicLexs, SourceLineBeginLex, RemLex, NumberLex,
    filter as LexIter,
    DummyLex,
    StringLex,
    OperatorLex,
    KeyWordLex,
    IDLex,
    StatementLex
} from './Lexer';
import { SRemStatement, IRemStatement, ARemStatement } from './RemStatement';
import { Statement } from './Statement';
import { SStatements } from './Statements';
import { ConstExpression, Expression, BinaryOpExpression, UnaryOpExpression, VarRefExpression } from './OperatorExp';
import { SLetStatement, ILetStatement, ALetStatement } from './LetStatement';
import { SRunStatement, IRunStatement, ARunStatement } from './RunStatement';

/**
 * Парсинг BASIC
 */
export class Parser {
    readonly ptr : Pointer<Lex>

    /**
     * Конструктор
     * @param lexs лексемы 
     */
    constructor( lexs:Lex[] ){
        this.ptr = new Pointer<Lex>(lexs)
    }

    /**
     * Конструктор
     * @param source исходный текст
     */
    static create( source:string ):Parser {
        return new Parser( parseBasicLexs(source) )
    }

    debug:boolean = false
    log( ...args:any[] ){
        if( this.debug ){
            console.log( ...args )
        }
    }

    /**
     * statements ::= { statement }
     */
    statements(): SStatements|null {
        const res:Statement[] = []
        if( this.ptr.eof )return null

        const total = this.ptr.entries.length
        const tailEntries = this.ptr.gets( total - this.ptr.ptr )
        const lines = LexIter(tailEntries).lines
        let firstLex : Lex | null = null
        let lastLex :  Lex | null = null

        this.log("statements() lines:", lines)

        for( let li=0; li<lines.length; li++ ){
            const lineLex = lines[li]

            if( firstLex==null && lineLex.length>0 ){
                firstLex = lineLex[0]
            }
            if( lineLex.length>0 ){
                lastLex = lineLex[lineLex.length-1]
            }

            this.log("statements() line:", lineLex)

            const lineParser = new Parser(lineLex)
            lineParser.debug = this.debug

            while( !lineParser.ptr.eof ){
                const lineStatement = lineParser.statement()
                if( lineStatement ){
                    res.push( lineStatement )
                }else {
                    throw new Error( "can't parse line: "+JSON.stringify(lineParser.ptr.gets(5)) )
                }
            }
        }

        if( firstLex!=null && lastLex!=null ){
            return new SStatements(firstLex, lastLex, res)
        }

        return new SStatements(new DummyLex(-1,-1), new DummyLex(-1,-1), res)
    }

    /**
     * statement ::= remStatement 
     *             | letStatement
     *             | runStatement
     */
    statement():Statement|null {
        this.log('statement() ptr=',this.ptr.gets(3))

        const remStmt = this.remStatement()
        if( remStmt )return remStmt

        const letStmt = this.letStatement()
        if( letStmt )return letStmt

        const runStmt = this.runStatement()
        if( runStmt )return runStmt

        return null
    }

    /**
     * remStatement ::= SourceLineBeginLex RemLex
     *                | NumberLex RemLex
     *                | RemLex
     */
    remStatement():ARemStatement|null {
        if( this.ptr.eof )return null
        
        let [lex1, lex2] = this.ptr.gets(2)
        if( lex1 instanceof SourceLineBeginLex && lex2 instanceof RemLex ){
            this.ptr.move(2)
            return new SRemStatement(lex1,lex2,lex2)
        }
        if( lex1 instanceof NumberLex && lex2 instanceof RemLex ){
            this.ptr.move(2)
            return new SRemStatement(lex1.asSourceLine,lex2,lex2)
        }
        if( lex1 instanceof RemLex ){
            this.ptr.move(1)
            return new IRemStatement(lex1,lex1,lex1)
        }

        return null
    }

    /**
     * letStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                  StatementLex(LET) IDLex OperatorLex(=) expression
     */
    letStatement():ALetStatement|null {
        if( this.ptr.eof )return null

        let lineNum : number | undefined = undefined
        let lineNumLex = this.ptr.get(0)
        let off = 0
        if( lineNumLex instanceof SourceLineBeginLex 
            || lineNumLex instanceof NumberLex 
        ){
            if( lineNumLex instanceof SourceLineBeginLex ){
                lineNum = lineNumLex.line
            }
            if( lineNumLex instanceof NumberLex ){
                lineNum = lineNumLex.value
            }
            off = 1
        }

        let lexLet = this.ptr.get(off)
        if( lexLet instanceof StatementLex && 
            lexLet.keyWord == 'LET'
        ){
            let [ lexId, lexAssign ] = this.ptr.fetch(off+1,2)
            if( lexAssign instanceof OperatorLex && lexAssign.keyWord == '=' 
            &&  lexId instanceof IDLex
            ){
                // parsing...
                this.ptr.push()
                let begin = this.ptr.get() || lexLet

                this.ptr.move(off+3)
                let exp = this.expression()
                if( exp ){
                    this.ptr.drop()
                    let end = exp.rightTreeLex || begin
                    if( lineNum ){
                        return new SLetStatement(begin,end,lexId,exp)
                    }else{
                        return new ILetStatement(begin,end,lexId,exp)
                    }
                }else{
                    // syntax error
                    this.ptr.pop()
                    return null
                }
            }else{
                // syntax error
                return null
            }
        }

        return null
    }

    /**
     * runStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                  StatementLex(RUN) [lineNumber : NumberLex]
     */
    runStatement():ARunStatement|null {
        if( this.ptr.eof )return null
        this.log('runStatement() ptr=',this.ptr.gets(3))

        let lineNum : number | undefined = undefined
        let lineNumLex = this.ptr.get(0)
        let off = 0
        if( lineNumLex instanceof SourceLineBeginLex 
            || lineNumLex instanceof NumberLex 
        ){
            if( lineNumLex instanceof SourceLineBeginLex ){
                lineNum = lineNumLex.line
            }
            if( lineNumLex instanceof NumberLex ){
                lineNum = lineNumLex.value
            }
            off = 1
        }

        let runLex = this.ptr.get(off)
        if( runLex instanceof StatementLex && 
            runLex.keyWord == 'RUN'
        ){
            this.log('runStatement() RUN')

            let runLineLex = this.ptr.get(off+1)
            if( runLineLex instanceof NumberLex ){
                off+=2
                this.ptr.move(off)
                this.log('runStatement() move ',off, 
                    { eof: this.ptr.eof
                    , gets3: this.ptr.gets(3)
                    }
                )

                return lineNum != undefined ?
                    new SRunStatement(lineNumLex || runLex, runLineLex, runLineLex) :
                    new IRunStatement(lineNumLex || runLex, runLineLex, runLineLex)
            }

            off+=1
            this.ptr.move(off)

            return lineNum != undefined ?
                new SRunStatement(lineNumLex || runLex, runLex) :
                new IRunStatement(lineNumLex || runLex, runLex)
        }

        return null
    }

    /**
     * expression ::= powExpression | bracketExpression
     */
    expression():Expression|null {
        this.log('expression() ptr=', this.ptr.gets(3))

        let powExp = this.powExpression()
        if( powExp )return powExp

        let brExp = this.bracketExpression()
        if( brExp )return brExp

        return null
    }

    /**
     * bracketExpression ::= '(' expression ')'
     */
    bracketExpression(){
        if( this.ptr.eof )return null
        
        let leftBr = this.ptr.get(0)
        if( leftBr instanceof KeyWordLex && leftBr.keyWord=='(' ){
            this.ptr.push()
            this.ptr.move(1)

            let exp = this.expression()
            if( exp ){
                let rightBr = this.ptr.get(0)
                if( rightBr instanceof KeyWordLex && rightBr.keyWord==')' ){
                    this.ptr.move(1)
                    this.ptr.drop()
                    return exp
                }
            }
            this.ptr.pop()
        }

        return null
    }

    /**
     * powExpression ::= mulExpression [ '^' expression ]
     */
    powExpression(){
        this.log('powExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.mulExpression()
        if( leftOp ){
            let lx = this.ptr.get()
            if( lx instanceof OperatorLex && 
                (lx.keyWord=='^') 
            ){
                this.ptr.move(1)
                let rightOp = this.expression()
                if( rightOp ){
                    this.ptr.drop()
                    return new BinaryOpExpression(lx,leftOp,rightOp)
                }
            }else{
                this.ptr.drop()
                return leftOp
            }
        }
        this.ptr.pop()
        return null
    }

    /**
     * mulExpression ::= intDivExpression [ ( '*' | '/' ) expression ]
     */
    mulExpression(){
        this.log('mulExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.intDivExpression()
        if( leftOp ){
            let lx = this.ptr.get()
            if( lx instanceof OperatorLex && 
                (lx.keyWord=='*'  || lx.keyWord=='/') 
            ){
                this.ptr.move(1)
                let rightOp = this.expression()
                if( rightOp ){
                    this.ptr.drop()
                    return new BinaryOpExpression(lx,leftOp,rightOp)
                }
            }else{
                this.ptr.drop()
                return leftOp
            }
        }
        this.ptr.pop()
        return null
    }

    /**
     * intDivExpression ::= modExpression [ '\' expression ]
     */
    intDivExpression(){
        this.log('intDivExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.modExpression()
        if( leftOp ){
            let lx = this.ptr.get()
            if( lx instanceof OperatorLex && 
                (lx.keyWord=='\\') 
            ){
                this.ptr.move(1)
                let rightOp = this.expression()
                if( rightOp ){
                    this.ptr.drop()
                    return new BinaryOpExpression(lx,leftOp,rightOp)
                }
            }else{
                this.ptr.drop()
                return leftOp
            }
        }
        this.ptr.pop()
        return null
    }

    /**
     * modExpression ::= plusExpression [ 'MOD' expression ]
     */
    modExpression(){
        this.log('modExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()

        // let unary = false
        // let unaryLx = this.ptr.get()
        // if( unaryLx instanceof OperatorLex && (unaryLx.keyWord=='-' || unaryLx.keyWord=='+')){
        //     this.ptr.move(1)
        //     unary = true
        // }

        let leftOp = this.plusExpression()
        if( leftOp ){
            let lx = this.ptr.get()
            if( lx instanceof OperatorLex && 
                (lx.keyWord=='MOD') 
            ){
                this.ptr.move(1)
                let rightOp = this.expression()
                if( rightOp ){
                    this.ptr.drop()
                    let binOp = new BinaryOpExpression(lx,leftOp,rightOp)
                    // if( unary ){
                    //     return new UnaryOpExpression(unaryLx as OperatorLex,binOp)
                    // }
                    return binOp
                }
            }else{
                this.ptr.drop()
                // if( unary ){
                //     return new UnaryOpExpression(unaryLx as OperatorLex, leftOp)
                // }
                return leftOp
            }
        }
        this.ptr.pop()
        return null
    }

    /**
     * plusExpression ::= relationExpression [ ('+' | '-') expression ]
     */
    plusExpression(){
        this.log('plusExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.relationExpression()
        if( leftOp ){
            let lx = this.ptr.get()
            if( lx instanceof OperatorLex && 
                (lx.keyWord=='+'  || lx.keyWord=='-') 
            ){
                this.ptr.move(1)
                let rightOp = this.expression()
                if( rightOp ){
                    this.ptr.drop()
                    return new BinaryOpExpression(lx,leftOp,rightOp)
                }
            }else{
                this.ptr.drop()
                return leftOp
            }
        }
        this.ptr.pop()
        return null
    }

    //unaryExpression(){        
    //}

    /**
     * relationExpression ::= notExpression [ ('=', '<>', '><', '<', '>', '>=', '<=', '=>', '=<') expression ]
     */
    relationExpression(){
        this.log('relationExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.notExpression()
        if( leftOp ){
            let lx = this.ptr.get()
            if( lx instanceof OperatorLex && 
                (lx.keyWord=='='  || lx.keyWord=='<>' ||
                 lx.keyWord=='><' || lx.keyWord=='<'  || lx.keyWord=='>' ||
                 lx.keyWord=='<=' || lx.keyWord=='>=' ||
                 lx.keyWord=='=<' || lx.keyWord=='=>'
                ) 
            ){
                this.ptr.move(1)
                let rightOp = this.expression()
                if( rightOp ){
                    this.ptr.drop()
                    return new BinaryOpExpression(lx,leftOp,rightOp)
                }
            }else{
                this.ptr.drop()
                return leftOp
            }
        }
        this.ptr.pop()
        return null
    }

    /**
     * notExpression ::= ['NOT'] andExpression
     */
    notExpression(){
        this.log('notExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        
        let lx = this.ptr.get()
        if( lx instanceof OperatorLex && lx.keyWord=='NOT' ){
            this.ptr.push()
            this.ptr.move(1)
            let exp = this.andExpression()
            if( exp ){
                this.ptr.drop()
                return new UnaryOpExpression(lx,exp)
            }
            this.ptr.pop()
            return null
        }

        return this.andExpression()
    }

    /**
     * andExpression ::= orExpression [ 'AND' expression ]
     */
    andExpression(){
        this.log('andExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.orExpression()
        if( leftOp ){
            let lx = this.ptr.get()
            if( lx instanceof OperatorLex && lx.keyWord=='AND' ){
                this.ptr.move(1)
                let rightOp = this.expression()
                if( rightOp ){
                    this.ptr.drop()
                    return new BinaryOpExpression(lx,leftOp,rightOp)
                }
            }else{
                this.ptr.drop()
                return leftOp
            }
        }
        this.ptr.pop()
        return null
    }

    /**
     * orExpression ::= xorExpression [ 'OR' expression ]
     */
    orExpression(){
        this.log('orExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.xorExpression()
        if( leftOp ){
            let lx = this.ptr.get()
            if( lx instanceof OperatorLex && lx.keyWord=='OR' ){
                this.ptr.move(1)
                let rightOp = this.expression()
                if( rightOp ){
                    this.ptr.drop()
                    return new BinaryOpExpression(lx,leftOp,rightOp)
                }
            }else{
                this.ptr.drop()
                return leftOp
            }
        }
        this.ptr.pop()
        return null
    }

    /**
     * xorExpression ::= eqvExpression [ 'XOR' expression ]
     */
    xorExpression(){
        this.log('xorExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.eqvExpression()
        if( leftOp ){
            let lx = this.ptr.get()
            if( lx instanceof OperatorLex && lx.keyWord=='XOR' ){
                this.ptr.move(1)
                let rightOp = this.expression()
                if( rightOp ){
                    this.ptr.drop()
                    return new BinaryOpExpression(lx,leftOp,rightOp)
                }
            }else{
                this.ptr.drop()
                return leftOp
            }
        }
        this.ptr.pop()
        return null
    }

    /**
     * eqvExpression ::= impExpression [ 'EQV' expression ]
     */
    eqvExpression(){
        this.log('eqvExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.impExpression()
        if( leftOp ){
            let lx = this.ptr.get()
            if( lx instanceof OperatorLex && lx.keyWord=='EQV' ){
                this.ptr.move(1)
                let rightOp = this.expression()
                if( rightOp ){
                    this.ptr.drop()
                    return new BinaryOpExpression(lx,leftOp,rightOp)
                }
            }else{
                this.ptr.drop()
                return leftOp
            }
        }
        this.ptr.pop()
        return null
    }

    /**
     * impExpression ::= [ '+' | '-' ] baseValueExpression [ 'IMP' expression ]
     */
    impExpression(){
        this.log('impExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null

        this.ptr.push()

        let unary = false
        let unaryLx = this.ptr.get()
        if( unaryLx instanceof OperatorLex && (unaryLx.keyWord=='-' || unaryLx.keyWord=='+')){
            this.ptr.move(1)
            unary = true
        }

        let leftOp = this.baseValueExpression()
        if( leftOp ){
            let lx = this.ptr.get()
            if( lx instanceof OperatorLex && lx.keyWord=='IMP' ){
                this.ptr.move(1)
                let rightOp = this.expression()
                if( rightOp ){
                    this.ptr.drop()
                    if( unary ){
                        return new UnaryOpExpression(
                            unaryLx as OperatorLex,
                            new BinaryOpExpression(lx,leftOp,rightOp)
                        )
                    }
                    return new BinaryOpExpression(lx,leftOp,rightOp)
                }
            }else{
                this.ptr.drop() 
                if( unary ){
                    return new UnaryOpExpression(
                        unaryLx as OperatorLex,
                        leftOp
                    )
                }               
                return leftOp
            }
        }
        this.ptr.pop()
        return null
    }

    /**
     * baseValueExpression ::= constExpression | varRefExpression
     */
    baseValueExpression():Expression|null {
        this.log('baseValueExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        
        let cexpr = this.constExpression()
        this.log( 'baseValueExpression() cexpr=',cexpr )

        if( cexpr ){
            this.log('baseValueExpression() res=', cexpr)
            return cexpr
        }

        let vrefExp = this.varRefExpression()
        this.log( 'baseValueExpression() vrefExp=',vrefExp )
        if( vrefExp ){
            this.log('baseValueExpression() res=', vrefExp)
            return vrefExp
        }

        return null
    }

    /**
     * constExpression ::= NumberLex | StringLex
     */
    constExpression() : ConstExpression | null {
        this.log('constExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        let lx = this.ptr.get()
        if( lx instanceof NumberLex ){
            this.ptr.move(1)
            return new ConstExpression( lx, lx.value )
        }
        if( lx instanceof StringLex ){
            this.ptr.move(1)
            return new ConstExpression( lx, lx.value )
        }
        return null
    }

    /**
     * varRefExpression ::= IDLex
     */
    varRefExpression():VarRefExpression|null {
        this.log('varRefExpression() ptr=',this.ptr.gets(3))
        if( this.ptr.eof )return null

        let lx = this.ptr.get()
        this.log('varRefExpression() lx=',lx)

        if( lx instanceof IDLex ){
            this.log('varRefExpression() succ',lx)
            this.ptr.move(1)
            return new VarRefExpression(lx)
        }

        return null
    }
}
