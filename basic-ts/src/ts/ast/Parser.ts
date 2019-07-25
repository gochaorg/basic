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
import { RemStatement } from './RemStatement';
import { Statement } from './Statement';
import { Statements } from './Statements';
import { LiteralExpression, Expression, BinaryOpExpression, UnaryOpExpression, VarRefExpression, VarArrIndexRef } from './OperatorExp';
import { LetStatement } from './LetStatement';
import { RunStatement } from './RunStatement';
import { GotoStatement } from './GotoStatement';
import { IfStatement } from './IfStatement';
import { GoSubStatement } from './GoSubStatement';
import { ReturnStatement } from './ReturnStatement';

/**
 * Опции парсера
 */
export class Options {
    /**
     * парсинг statement с учетом номера строки
     */
    tryLineNum:boolean = true

    /**
     * Клонирование
     */
    clone(conf?:(cloned:Options)=>any):Options {
        const c = new Options()
        c.tryLineNum = this.tryLineNum
        if( conf ){
            conf(c)
        }
        return c
    }
}

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
     * Опции
     */
    readonly options = new Options()

    /**
     * statements ::= { statement }
     */
    statements(): Statements|null {
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
            return new Statements(firstLex, lastLex, res)
        }

        return new Statements(new DummyLex(-1,-1), new DummyLex(-1,-1), res)
    }

    /**
     * statement ::= remStatement 
     *             | letStatement
     *             | runStatement
     *             | gotoStatement
     *             | ifStatement
     *             | gosubStatement
     *             | returnStatement
     */
    statement(opts?:Options):Statement|null {
        if( !opts ){ opts = this.options }
        this.log('statement() ptr=',this.ptr.gets(3))

        const remStmt = this.remStatement(opts)
        if( remStmt )return remStmt

        const letStmt = this.letStatement(opts)
        if( letStmt )return letStmt

        const runStmt = this.runStatement(opts)
        if( runStmt )return runStmt

        const gotoStmt = this.gotoStatement(opts)
        if( gotoStmt )return gotoStmt

        const ifStmt = this.ifStatement(opts)
        if( ifStmt )return ifStmt

        const gosubStmt = this.gosubStatement(opts)
        if( gosubStmt )return gosubStmt

        const returnStmt = this.returnStatement(opts)
        if( returnStmt )return returnStmt

        return null
    }

    /**
     * Проверка если текущая лексема обозначает начало нумерованной строки, 
     * то лексема и номер строки передается в функцию, 
     * а указатель смещается к след лексеме.
     * 
     * Функция модет вернуть null, тогда будет восстановлена позиция
     * @param proc функция принимающая номер строки
     */
    matchLine<T extends Statement>( proc:(arg:{line:number,lex:Lex})=>T|null ):T|null{
        let lineNum : number | undefined = undefined
        let lineNumLex = this.ptr.get(0)
        if( (  lineNumLex instanceof SourceLineBeginLex 
            || lineNumLex instanceof NumberLex 
            )
        ){
            if( lineNumLex instanceof SourceLineBeginLex ){
                lineNum = lineNumLex.line
            }
            if( lineNumLex instanceof NumberLex ){
                lineNum = lineNumLex.value
            }
            if( lineNum ){
                this.ptr.push()
                this.ptr.move(1)
                let res:T|null = proc({line:lineNum, lex:lineNumLex})
                if( res ){
                    this.ptr.drop()
                    return res
                }
                this.ptr.pop()
            }
        }
        return null
    }

    /**
     * remStatement ::= SourceLineBeginLex RemLex
     *                | NumberLex RemLex
     *                | RemLex
     */
    remStatement(opts?:Options):RemStatement|null {
        if( !opts ){ opts = this.options }
        if( this.ptr.eof )return null
        
        let [lex1, lex2] = this.ptr.gets(2)
        if( lex1 instanceof SourceLineBeginLex && lex2 instanceof RemLex && opts.tryLineNum ){
            this.ptr.move(2)
            return new RemStatement(lex1,lex2,lex2)
        }
        if( lex1 instanceof NumberLex && lex2 instanceof RemLex && opts.tryLineNum ){
            this.ptr.move(2)
            return new RemStatement(lex1.asSourceLine,lex2,lex2)
        }
        if( lex1 instanceof RemLex ){
            this.ptr.move(1)
            return new RemStatement(lex1,lex1,lex1)
        }

        return null
    }

    /**
     * letStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                  StatementLex(LET) IDLex OperatorLex(=) expression
     */
    letStatement(opts?:Options):LetStatement|null {
        if( !opts ){ opts = this.options }
        if( this.ptr.eof )return null

        // let lineNum : number | undefined = undefined
        // let lineNumLex = this.ptr.get(0)
        // let off = 0
        // if( opts.tryLineNum && 
        //     (  lineNumLex instanceof SourceLineBeginLex 
        //     || lineNumLex instanceof NumberLex 
        //     )
        // ){
        //     if( lineNumLex instanceof SourceLineBeginLex ){
        //         lineNum = lineNumLex.line
        //     }
        //     if( lineNumLex instanceof NumberLex ){
        //         lineNum = lineNumLex.value
        //     }
        //     off = 1
        // }

        const prod = (arg?:{line:number,lex:Lex}) => {
            this.ptr.push()
            let lexLet = this.ptr.get()
            if( lexLet instanceof StatementLex && lexLet.LET ){
                this.ptr.move(1)
            }else{
                this.ptr.pop()
                return null
            }

            const lexId = this.ptr.get()
            if( lexId instanceof IDLex ){
                const lxNext = this.ptr.get(1)
                if( lxNext instanceof OperatorLex && lxNext.keyWord == '=' ){
                    this.ptr.move(2)
                    const exp = this.expression()
                    if( exp ){
                        const begin = arg ? arg.lex : lexLet
                        let end = exp.rightTreeLex || begin
                        this.ptr.drop()
                        return new LetStatement(begin,end,lexId,exp)
                    }
                }

                // if( lxNext instanceof OperatorLex && lxNext.arrBrOpen ){
                //     this.ptr.move(2)
                //     //let exp
                // }
            }

            this.ptr.pop()
            return null
        }

        if( opts.tryLineNum ){
            return this.matchLine(prod) || prod()
        }else{
            return prod()
        }

        // let lexLet = this.ptr.get(off)
        // if( lexLet instanceof StatementLex && 
        //     lexLet.LET
        // ){
        //     let [ lexId, lxNext ] = this.ptr.fetch(off+1,2)
        //     if( lxNext instanceof OperatorLex && lxNext.keyWord == '=' 
        //     &&  lexId instanceof IDLex
        //     ){
        //         // parsing...
        //         this.ptr.push()
        //         let begin = this.ptr.get() || lexLet

        //         this.ptr.move(off+3)
        //         let exp = this.expression()
        //         if( exp ){
        //             this.ptr.drop()
        //             let end = exp.rightTreeLex || begin
        //             return new LetStatement(begin,end,lexId,exp)
        //         }else{
        //             // syntax error
        //             this.ptr.pop()
        //             return null
        //         }
        //     }else{
        //         // syntax error
        //         return null
        //     }
        // }

        // return null
    }

    /**
     * runStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                  StatementLex(RUN) [lineNumber : NumberLex]
     */
    runStatement(opts?:Options):RunStatement|null {
        if( !opts ){ opts = this.options }
        if( this.ptr.eof )return null
        this.log('runStatement() ptr=',this.ptr.gets(3))

        let lineNum : number | undefined = undefined
        let lineNumLex = this.ptr.get(0)
        let off = 0
        if( opts.tryLineNum &&
            (  lineNumLex instanceof SourceLineBeginLex 
            || lineNumLex instanceof NumberLex 
            )
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
            runLex.RUN
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

                return new RunStatement(lineNumLex || runLex, runLineLex, runLineLex)
            }

            off+=1
            this.ptr.move(off)

            return new RunStatement(lineNumLex || runLex, runLex)
        }

        return null
    }

    /**
     * gotoStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                   StatementLex(GOTO) lineNumber:NumberLex
     * @param opts опции компилятора
     */
    gotoStatement(opts?:Options):Statement|null {
        if( !opts ){ opts = this.options }
        if( this.ptr.eof )return null
        this.log('gotoStatement() ptr=',this.ptr.gets(3))

        const prod = ( linf?:{line:number,lex:Lex} ) => {
            let [gtLex,gtLine] = this.ptr.gets(2)
            if( gtLex instanceof StatementLex 
            &&  gtLex.GOTO
            &&  gtLine instanceof NumberLex 
            ){
                this.ptr.move(2)
                return new GotoStatement(linf ? linf.lex : gtLex, gtLine, gtLine )
            }
            return null
        }
        if( opts.tryLineNum ){
            return this.matchLine(prod) || prod()
        }else{
            return prod()
        }
    }

    /**
     * gotoStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                   StatementLex(GOSUB) lineNumber:NumberLex
     * @param opts опции компилятора
     */
    gosubStatement(opts?:Options):Statement|null {
        if( !opts ){ opts = this.options }
        if( this.ptr.eof )return null
        this.log('gosubStatement() ptr=',this.ptr.gets(3))

        const prod = ( linf?:{line:number,lex:Lex} ) => {
            let [gtLex,gtLine] = this.ptr.gets(2)
            if( gtLex instanceof StatementLex 
            &&  gtLex.GOSUB
            &&  gtLine instanceof NumberLex 
            ){
                this.ptr.move(2)
                return new GoSubStatement(linf ? linf.lex : gtLex, gtLine, gtLine )
            }
            return null
        }
        if( opts.tryLineNum ){
            return this.matchLine(prod) || prod()
        }else{
            return prod()
        }
    }

    /**
     * returnStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                   StatementLex(RETURN) [lineNumber:NumberLex]
     * @param opts опции компилятора
     */
    returnStatement(opts?:Options):Statement|null {
        if( !opts ){ opts = this.options }
        if( this.ptr.eof )return null
        this.log('returnStatement() ptr=',this.ptr.gets(3))

        const prod = ( linf?:{line:number,lex:Lex} ) => {
            let [gtLex] = this.ptr.gets(1)
            if( gtLex instanceof StatementLex 
            &&  gtLex.RETURN            
            ){
                this.ptr.move(1)
                let [gtLine] = this.ptr.fetch(0,1)
                if( gtLine instanceof NumberLex ){
                    this.ptr.move(1)
                    return new ReturnStatement(linf ? linf.lex : gtLex, gtLine, gtLine )
                }else{
                    return new ReturnStatement(linf ? linf.lex : gtLex, gtLine )
                }
            }
            return null
        }
        if( opts.tryLineNum ){
            return this.matchLine(prod) || prod()
        }else{
            return prod()
        }
    }

    /**
     * ifStatement ::= [ SourceLineBeginLex | NumberLex ]
     *                 StatementLex(IF) expression 
     *                 StatementLex(THEN) statement
     *                 [StatementLex(ELSE) statement]
     * @param opts опции компилятора
     */
    ifStatement(opts?:Options):Statement|null {
        if( !opts ){ opts = this.options }
        if( this.ptr.eof )return null
        this.log('ifStatement() ptr=',this.ptr.gets(3))

        const prod = ( linf?:{line:number,lex:Lex} ) => {
            let ifLx = this.ptr.get()
            console.log("ifLx ",ifLx)
            if( !ifLx )return null
            if( !(ifLx instanceof StatementLex) )return null
            if( !(ifLx.IF) )return null

            this.ptr.push()
            this.ptr.move(1)
            let exp = this.expression()
            if( !exp ){
                this.ptr.pop()
                return null
            }

            let thenLx = this.ptr.get()
            if( thenLx instanceof StatementLex && !thenLx.THEN ){
                this.ptr.pop()
                return null
            }
            this.ptr.move(1)

            const conf = (op:Options)=>{op.tryLineNum = false}
            let trueSt : Statement|null = this.statement(
                opts ? opts.clone(conf) : this.options.clone(conf)
            )            
            if( trueSt==null ){
                this.ptr.pop()
                return null
            }

            let elseLx = this.ptr.get()
            let falseSt : Statement | null = null
            if( elseLx instanceof StatementLex && elseLx.ELSE ){
                this.ptr.push()
                this.ptr.move(1)
                falseSt = this.statement(
                    opts ? opts.clone(conf) : this.options.clone(conf)
                )
                if( falseSt ){
                    this.ptr.drop()
                }else{
                    this.ptr.pop()
                }
            }
            this.ptr.drop()

            if( falseSt ){
                return new IfStatement(
                    linf ? linf.lex : ifLx,
                    falseSt ? falseSt.end : trueSt.end,
                    exp,
                    trueSt,
                    falseSt
                )
            }

            return new IfStatement(
                linf ? linf.lex : ifLx,
                trueSt.end,
                exp,
                trueSt
            )        
        }
        
        if( opts.tryLineNum ){
            return this.matchLine(prod) || prod()
        }else{
            return prod()
        }
    }

    /**
     * expression ::= impExpression | bracketExpression
     */
    expression():Expression|null {
        this.log('expression() ptr=', this.ptr.gets(3))

        let powExp = this.impExpression()
        if( powExp )return powExp

        let brExp = this.bracketExpression()
        if( brExp )return brExp

        return null
    }

    /**
     * bracketExpression ::= '(' expression ')'
     */
    bracketExpression():Expression|null{
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
     * Парсинг циклической конструкции:
     * leftOp { operator rightExp }
     * 
     * Проверяет что текущая лексема (operator) соответ указанной (accpetOperator), 
     * и если это так, то производит анализ правого операнда (rightExp)
     * В результате создает последовательность (дерево растет в лево)
     * бинарных операторов
     * @param ruleName имя правила
     * @param leftOp левый уже вычесленный операнд
     * @param rightExp вычисление правого операнда
     * @param accpetOperator проверка оператора
     */
    binaryRepeatExpression(
        ruleName:string,
        leftOp:Expression,
        rightExp:()=>Expression|null,
        accpetOperator:(op:OperatorLex)=>boolean
    ):Expression|null {
        let res : Expression = leftOp
        while( true ){
            let lx = this.ptr.get()
            if( lx instanceof OperatorLex && accpetOperator(lx) ){
                this.ptr.move(1)
                let rightOp = rightExp()
                this.log( `${ruleName} right=`,rightOp )
                if( rightOp ){
                    this.ptr.drop()
                    this.log( `${ruleName} succ=`,lx.keyWord,res,rightOp )
                    res = new BinaryOpExpression(lx,res,rightOp)
                    lx = this.ptr.get()
                    if( lx instanceof OperatorLex && accpetOperator(lx) ){
                        this.log(`${ruleName} has right ${lx.keyWord}`)
                        this.ptr.push()
                        continue
                    }
                    return res
                }else{
                    this.ptr.pop()
                    return null
                }
            }else{
                this.ptr.drop()
                return res
            }
        }
    }

    /**
     * impExpression ::= eqvExpression [ { 'IMP' eqvExpression } ]
     */
    impExpression():Expression|null{
        this.log('impExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null

        this.ptr.push()

        let leftOp = this.eqvExpression()
        if( leftOp ){
            return this.binaryRepeatExpression(
                'impExpression()',
                leftOp,
                ()=>this.eqvExpression(),
                (lx:OperatorLex)=>lx.imp
            )
        }
        this.ptr.pop()
        return null
    }

    /**
     * eqvExpression ::= xorExpression [ 'EQV' xorExpression ]
     */
    eqvExpression():Expression|null{
        this.log('eqvExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.xorExpression()
        if( leftOp ){
            return this.binaryRepeatExpression(
                'eqvExpression()',
                leftOp,
                ()=>this.xorExpression(),
                (lx:OperatorLex)=>lx.eqv
            )
        }
        this.ptr.pop()
        return null
    }

    /**
     * xorExpression ::= orExpression [ { 'XOR' orExpression } ]
     */
    xorExpression():Expression|null{
        this.log('xorExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.orExpression()
        if( leftOp ){
            return this.binaryRepeatExpression(
                'xorExpression()',
                leftOp,
                ()=>this.orExpression(),
                (lx:OperatorLex)=>lx.xor
            )
        }
        this.ptr.pop()
        return null
    }

    /**
     * orExpression ::= andExpression [ { 'OR' andExpression } ]
     */
    orExpression():Expression|null{
        this.log('orExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.andExpression()
        if( leftOp ){
            return this.binaryRepeatExpression(
                'orExpression()',
                leftOp,
                ()=>this.andExpression(),
                (lx:OperatorLex)=>lx.or
            )
        }
        this.ptr.pop()
        return null
    }

    /**
     * andExpression ::= notExpression [ { 'AND' notExpression } ]
     */
    andExpression():Expression|null{
        this.log('andExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.notExpression()
        if( leftOp ){
            return this.binaryRepeatExpression(
                'andExpression()',
                leftOp,
                ()=>this.notExpression(),
                (lx:OperatorLex)=>lx.and
            )
        }
        this.ptr.pop()
        return null
    }

    /**
     * notExpression ::= ['NOT'] relationExpression
     */
    notExpression():Expression|null{
        this.log('notExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        
        let lx = this.ptr.get()
        if( lx instanceof OperatorLex && lx.not ){
            this.ptr.push()
            this.ptr.move(1)
            let exp = this.relationExpression()
            if( exp ){
                this.ptr.drop()
                return new UnaryOpExpression(lx,exp)
            }
            this.ptr.pop()
            return null
        }

        return this.relationExpression()
    }

    /**
     * relationExpression ::= plusExpression [ ('=', '<>', '><', '<', '>', '>=', '<=', '=>', '=<') plusExpression ]
     */
    relationExpression():Expression|null{
        this.log('relationExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.plusExpression()
        if( leftOp ){
            let lx = this.ptr.get()
            if( lx instanceof OperatorLex && lx.ordReleation ){
                this.ptr.move(1)
                let rightOp = this.plusExpression()
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
     * plusExpression ::= modExpression [ { ('+' | '-') modExpression } ]
     */
    plusExpression():Expression|null{
        this.log('plusExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.modExpression()
        if( leftOp ){
            return this.binaryRepeatExpression(
                'plusExpression()',
                leftOp,
                ()=>this.modExpression(),
                (lx:OperatorLex)=>lx.plus || lx.minus
            )
        }
        this.ptr.pop()
        return null
    }

    /**
     * modExpression ::= intDivExpression [ { 'MOD' intDivExpression } ]
     */
    modExpression():Expression|null{
        this.log('modExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()

        let leftOp = this.intDivExpression()
        if( leftOp ){
            return this.binaryRepeatExpression(
                'modExpression()',
                leftOp,
                ()=>this.intDivExpression(),
                (lx:OperatorLex)=>lx.mod
            )
        }
        this.ptr.pop()
        return null
    }

    /**
     * intDivExpression ::= mulExpression [ { '\' mulExpression } ]
     */
    intDivExpression():Expression|null{
        this.log('intDivExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.mulExpression()
        if( leftOp ){
            return this.binaryRepeatExpression(
                'intDivExpression()',
                leftOp,
                ()=>this.mulExpression(),
                (lx:OperatorLex)=>lx.idiv
            )
        }
        this.ptr.pop()
        return null
    }

    /**
     * mulExpression ::= powExpression [ { ( '*' | '/' ) powExpression } ]
     */
    mulExpression():Expression|null{
        this.log('mulExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        this.ptr.push()
        let leftOp = this.powExpression()
        if( leftOp ){
            return this.binaryRepeatExpression(
                'mulExpression()',
                leftOp,
                ()=>this.powExpression(),
                (lx:OperatorLex)=>lx.mult || lx.div
            )
        }
        this.ptr.pop()
        return null
    }

    /**
     * powExpression ::= signedAtom [ { '^' signedAtom } ]
     */
    powExpression():Expression|null{
        this.log('powExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null

        this.ptr.push()

        let leftOp = this.signedAtom()
        if( leftOp ){
            return this.binaryRepeatExpression(
                'powExpression()',
                leftOp,
                ()=>this.signedAtom(),
                (lx:OperatorLex)=>lx.pow
            )
        }
        this.ptr.pop()
        return null
    }

    /**
     * signedAtom ::= [ '+' | '-' ] atom
     */
    signedAtom():Expression|null {
        this.log('signedAtom() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null

        this.ptr.push()

        let unary = false
        let unaryLx = this.ptr.get()
        if( unaryLx instanceof OperatorLex && (unaryLx.keyWord=='-' || unaryLx.keyWord=='+')){
            this.ptr.move(1)
            unary = true
        }

        let atom = this.atom()
        if( atom ){
            this.ptr.drop()
            if( unary ){
                return new UnaryOpExpression(
                    unaryLx as OperatorLex,
                    atom
                )
            }
            return atom;
        }

        this.ptr.pop()
        return null
    }

    /**
     * atom ::= '(' expression ')'
     *        | baseValueExpression
     */
    atom():Expression|null {
        this.log('atom() ptr=', this.ptr.gets(3))

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

        return this.baseValueExpression()        
    }

    /**
     * baseValueExpression ::= constExpression 
     *                       | varRefExpression '(' expression [{ ',' expression }] ')'
     *                       | varRefExpression
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
            const brOpen = this.ptr.get()
            if( brOpen instanceof OperatorLex && brOpen.arrBrOpen ){
                let parseArrSucc = true
                const indexExpression:Expression[] = []
                this.ptr.push()
                this.ptr.move(1)
                while(true){
                    const idxExp = this.expression()
                    if( idxExp ){
                        indexExpression.push(idxExp)                        
                    }else{
                        this.ptr.pop()
                        parseArrSucc = false
                        break
                    }
                    const lxNext = this.ptr.get()
                    if( lxNext instanceof OperatorLex ){
                        if( lxNext.argDelim ){
                            this.ptr.move(1)
                            continue
                        }else if( lxNext.arrBrClose ){
                            this.ptr.move(1)
                            break
                        }
                    }
                }
                if( parseArrSucc ){
                    this.ptr.drop()
                    return new VarArrIndexRef(vrefExp.id, indexExpression)
                }
            }
            return vrefExp
        }

        return null
    }

    /**
     * constExpression ::= NumberLex | StringLex
     */
    constExpression() : LiteralExpression|null {
        this.log('constExpression() ptr=', this.ptr.gets(3))

        if( this.ptr.eof )return null
        let lx = this.ptr.get()
        if( lx instanceof NumberLex ){
            this.ptr.move(1)
            return new LiteralExpression( lx, lx.value )
        }
        if( lx instanceof StringLex ){
            this.ptr.move(1)
            return new LiteralExpression( lx, lx.value )
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
