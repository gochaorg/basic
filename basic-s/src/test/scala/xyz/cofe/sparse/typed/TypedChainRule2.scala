package xyz.cofe.sparse.typed

import xyz.cofe.sparse.{BasicCharPointer, CharPointer}
import xyz.cofe.sparse.{Pointer,Tok}
import xyz.cofe.sparse.typed.{GR}

/**
  * Проработка списка DSL для описания правил
  */
object TypedChainRule2 {
  import Chars._;
  import GOPS._;
  import TypedChainRule1.{number3, ws, Num, WS}

  // Правильное math
  // exp ::= sum
  // sum ::= mul + mul
  // mul ::= atom * atom
  // atom ::= number | ( exp ) | - exp

  class AST( val begin:LPointer[CToken], val end:LPointer[CToken] ) extends Tok[LPointer[CToken]]
  class NumLitteral( begin:LPointer[CToken], end:LPointer[CToken], val value:Num ) extends AST(begin,end) {
    override def toString: String = s"NumLitteral value=${value.value}"
  }

  val atom : GR[LPointer[CToken],AST] = ptr => {
    val t = ptr.lookup(0)
    if( t.isEmpty ){
      None
    }else{
      val tv = t.get
      if( tv.isInstanceOf[Num] ){
        Some( new NumLitteral(ptr,ptr.move(1),tv.asInstanceOf[Num]) )
      }else{
        None
      }
    }
  }

  val operatorToken = Chars.ctest(c => (c=='+' || c=='-' || c=='*' || c=='/') );

  class Operator( begin:LPointer[CToken], end:LPointer[CToken], val op:CToken ) extends AST(begin,end){
    override def toString: String = s"${op.text}"
  }
  val operator : GR[LPointer[CToken],Operator] = ptr => {
    val _t = ptr.lookup(0)
    if( _t.isEmpty ){
      None
    }else{
      val t = _t.get
      t.text match {
        case "+" => Some(new Operator(ptr,ptr.move(1),t))
        case "-" => Some(new Operator(ptr,ptr.move(1),t))
        case "*" => Some(new Operator(ptr,ptr.move(1),t))
        case "/" => Some(new Operator(ptr,ptr.move(1),t))
        case _ => None
      }
    }
  }

  class SumOp( begin:LPointer[CToken], end:LPointer[CToken], val operator:Operator, val left:AST, val right:AST ) extends AST(begin, end){
    override def toString: String = s"SumOp op=$operator left=$left right=$right"
  }

  val sumOp = (atom + operator + atom) ==> ((left,op,right)=>{ new SumOp(left.begin, right.end, op, left, right) })

  def main(args:Array[String]):Unit = {
    val tokens = Tokenizer.tokens("12 + 45.56", List(number3, ws, operatorToken), null)
    val tokenList = tokens.toList.filter( x=> !x.isInstanceOf[WS] )
    tokenList.foreach( tok => println( s"tok $tok" ) )

    val tokPtr = new LPointer[CToken](0,tokenList)

    println( tokPtr.lookup(0))
    println( atom(tokPtr) )
    println( operator(tokPtr.move(1)))
    println( sumOp(tokPtr) )
  }
}
