TBASIC синтаксис
=================

Синтаксис
-----------

### statements
    statements ::= { statement }

### statement

    statement ::= remStatement 
                | letStatement
                | runStatement
                | gotoStatement
                | ifStatement
                | gosubStatement
                | returnStatement
                | printStatement
                | callStatement

### remStatement

    remStatement ::= SourceLineBeginLex RemLex
                   | NumberLex RemLex
                   | RemLex

### letStatement

    letStatement ::= [ SourceLineBeginLex | NumberLex ]
                     StatementLex(LET) IDLex OperatorLex(=) expression

### runStatement

    runStatement ::= [ SourceLineBeginLex | NumberLex ]
                     StatementLex(RUN) [lineNumber : NumberLex]

### gotoStatement

    gotoStatement ::= [ SourceLineBeginLex | NumberLex ]
                      StatementLex(GOTO) lineNumber:NumberLex

### gosubStatement
    gosubStatement ::= [ SourceLineBeginLex | NumberLex ]
                       StatementLex(GOSUB) lineNumber:NumberLex

### returnStatement
    returnStatement ::= [ SourceLineBeginLex | NumberLex ]
                        StatementLex(RETURN) [lineNumber:NumberLex]

### ifStatement
    ifStatement ::= [ SourceLineBeginLex | NumberLex ]
                    StatementLex(IF) expression 
                    StatementLex(THEN) statement
                    [StatementLex(ELSE) statement]

### printStatement
    printStatement ::= [ SourceLineBeginLex | NumberLex ]
                       StatementLex(PRINT) [expression {',' expression}]

### callStatement
    callStatement ::= [ SourceLineBeginLex | NumberLex ]
                      StatementLex(CALL) IDLex [expression {',' expression}] 

### expression
    expression ::= impExpression | bracketExpression

### bracketExpression
    bracketExpression ::= '(' expression ')'

### impExpression
    impExpression ::= eqvExpression [ { 'IMP' eqvExpression } ]

### eqvExpression
    eqvExpression ::= xorExpression [ 'EQV' xorExpression ]

### xorExpression
    xorExpression ::= orExpression [ { 'XOR' orExpression } ]

### orExpression
    orExpression ::= andExpression [ { 'OR' andExpression } ]

### andExpression
    andExpression ::= notExpression [ { 'AND' notExpression } ]

### notExpression
    notExpression ::= ['NOT'] relationExpression

### relationExpression
    relationExpression ::= plusExpression 
                           [ ('=' 
                           | '<>' | '><' 
                           | '<' | '>' 
                           | '>=' | '<=' 
                           | '=>' | '=<' 
                           ) plusExpression ]

### plusExpression
    plusExpression ::= modExpression [ { ('+' | '-') modExpression } ]

### modExpression
    modExpression ::= intDivExpression [ { 'MOD' intDivExpression } ]

### intDivExpression
    intDivExpression ::= mulExpression [ { '\' mulExpression } ]

### mulExpression
    mulExpression ::= powExpression [ { ( '*' | '/' ) powExpression } ]

### powExpression
    powExpression ::= signedAtom [ { '^' signedAtom } ]

### signedAtom
    signedAtom ::= [ '+' | '-' ] atom

### atom
    atom ::= '(' expression ')'
            | baseValueExpression

### baseValueExpression
    baseValueExpression ::= constExpression 
          | varRefExpression '(' expression [{ ',' expression }] ')'
          | varRefExpression

### constExpression
    constExpression ::= NumberLex | StringLex

### varRefExpression
    varRefExpression ::= IDLex

Лексемы
-----------------

### WhiteSpaceLex
Пробельные символы. В конечном списке лексем не используются.

	WhiteSpaceLex ::= ' '
                    | '\n'
                    | '\r'
                    | '\t'

### HexDigit, DecDigit, OctDigit
Цифры, используются как часть лексемы Number

	HexDigit ::= '0' | '1' | '2' | '3' | '4'
               | '5' | '6' | '7' | '8' | '9'
               | 'a' | 'b' | 'c' | 'd' | 'e' | 'f'
               | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

	DecDigit ::= '0' | '1' | '2' | '3' | '4'
               | '5' | '6' | '7' | '8' | '9'

	OctDigit ::= '0' | '1' | '2' | '3'
               | '4' | '5' | '6' | '7'

### NewLineLex
Лексема перевода строки, при парсенге может быть заменена на другую лексему

	NewLineLex ::= '\n\r'
                 | '\r\n'
                 | '\r'
                 | '\n'

### OperatorLex
Операторы, включают служебыные символы как скобки и запятые, которые по сути не являются операторами

	OperatorLex ::= '(' | ')'
                  | '^'
                  | '*' | '/'
                  | '\\'
                  | 'MOD'
                  | '+' | '-'
                  | '=' | '<>' | '><' | '<' | '>' | '<=' | '>=' | '=>'
                  | 'NOT'
                  | 'AND'
                  | 'OR'
                  | 'XOR'
                  | 'EQV'
                  | 'IMP'
                  | ','

### StatementLex
Утверждения из которых состоит программа

	StatementLex ::= 'LET' | 'RUN'
                   | 'GOTO' | 'GO TO'
                   | 'IF' | 'THEN' | 'ELSE'
                   | 'GOSUB' | 'GO SUB'
                   | 'RETURN'
                   | 'PRINT'
                   | 'CALL'

### RemLex
Комментарий до конца строки

	RemLex ::= 'REM' { ^NewLineLex }

### Number
Число

	OctNumber ::= ( '&o' | '&O' ) { OctDigit }

	HexNumber ::= ( '&h' | '&H' ) { HexDigit }

    DecNumber ::= [ '+' | '-' ]
                  DecDigit { DecDigit }
                  [
                    [ '.' DecDigit { DecDigit } ]
                    [ ( 'e' | 'E' | 'd' | 'D' ) [ '+' | '-' ] DecDigit { DecDigit } ]
                    [ '%' | '#' | '!' ]
                  ]

	Number ::= OctNumber | HexNumber | DecNumber

### StringLex
Строковой литерал

	StringLex ::= '"'
                  { ^( '"' | NewLineLex ) }
                  '"'

### IDLex
Идентификатор

	IDLex ::= ( 'a'..'z' | 'A'..'Z' )
              { 'a'..'z' | 'A'..'Z' | '0'..'9' | '.' }
              [ '#' | '!' | '%' | '$' ]

