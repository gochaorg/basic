import { Lex } from './Lexer'

/**
 * Некий кусок кода, который по традиции должен умещаться в одной строке
 */
export interface Statement {
    /**
     * Начальная лексема
     */
    readonly begin:Lex

    /**
     * Конечная лексема
     */
    readonly end:Lex
}

/**
 * Некий кусок кода, который имеет номер строки
 */
export interface SourceStatement extends Statement {    
}

/**
 * Некий кусок кода, который не имеет кода строки и должен быть исполнен прямо сейчас
 */
export interface ImmediateStatement extends Statement {
}