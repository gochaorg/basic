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

  type POINTER=LPointer[CToken]
  type PARSER[T <: Tok[POINTER]] = GR[POINTER,T]

  trait AST extends Tok[POINTER] { def begin:POINTER }
  class AAST( val begin:LPointer[CToken], val end:LPointer[CToken] ) extends Tok[LPointer[CToken]] with AST
  class NumLitteral( begin:LPointer[CToken], end:LPointer[CToken], val value:Num ) extends AAST(begin,end) {
    override def toString: String = s"NumLitteral(${value.value})"
  }

  val numAst : PARSER[AST] = ptr => {
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

  class SpecChar( val chr:POINTER ) extends AAST( chr, chr.move(1) )
  object SpecChar extends Enumeration {
    import scala.language.implicitConversions
    implicit def valueToOpVal(x:Value):Val = x.asInstanceOf[Val]
    protected case class Val(val txtConst:String)
      extends super.Val
      with PARSER[AST]
    {
      def apply(ptr:POINTER):Option[SpecChar]={
        val t = ptr.lookup(0)
        if( t.isEmpty ){
          None
        }else{
          val tv = t.get
          if( tv.text.equals(txtConst) ){
            Some( new SpecChar(ptr) )
          }else{
            None
          }
        }
      }
    }

    val BrOpen  = Val("(")
    val BrClose = Val("(")
  }

  object Op extends Enumeration {
    protected case class Val(val litteral:String) extends super.Val

    import scala.language.implicitConversions
    implicit def valueToOpVal(x:Value):Val = x.asInstanceOf[Val]

    val ADD = Val("+")
    val SUB = Val("-")
    val MUL = Val("*")
    val DIV = Val("/")
  }
  val operatorToken = Chars.ctest(c => Op.values.filter(o=>o.litteral.length==1 && o.litteral.charAt(0)==c).size>0 );
  class Operator( begin:LPointer[CToken], end:LPointer[CToken], val op:CToken ) extends AAST(begin,end){
    override def toString: String = s"${op.text}"
  }
  def operator(ops:Op.Value*):GR[LPointer[CToken],Operator] = {
    require(ops!=null)
    ptr => {
      val _t = ptr.lookup(0)
      if( _t.isEmpty ){
        None
      }else{
        val t = _t.get.text
        if( ops.exists(o => o.litteral.equals(t)) ){
          Some(new Operator(ptr,ptr.move(1),_t.get))
        }else{
          None
        }
      }
    }
  }

  def binaryOp[U <: AST]( op:PARSER[Operator], left:PARSER[AST], right:PARSER[AST], init:AST=>U, builder:(U,Operator,AST)=>U ) = {
    new GR[POINTER,U] {
      override def apply(ptr: POINTER): Option[U] = {
        require(ptr!=null)
        if(ptr.eof()){
          None
        }else{
          val leftRes = left(ptr)
          if( leftRes.isEmpty ){
            None
          }else{
            var res : U = init(leftRes.get);
            var p = leftRes.get.end
            var stop = false
            while( !stop ){
              if( p.eof() ){
                stop = true
              }else {
                val opRes = op(p)
                if (opRes.isEmpty) {
                  stop = true
                }else{
                  val riRes = right(opRes.get.end)
                  if( riRes.isEmpty ){
                    stop = true
                  }else{
                    res = builder( res, opRes.get, riRes.get )
                    p = riRes.get.end
                  }
                }
              }
            }
            Some(res)
          }
        }
      }
    }
  }
  class BinaryOp(val left:AST, val right:Option[(Operator,AST)]=None ) extends AAST( left.begin, right.map( _._2.end ).getOrElse( left.end ) ){
    override def toString: String = {
      if( right.isEmpty ){
        left.toString
      }else{
        s"${right.get._1}( $left , ${right.get._2} )"
      }
    }
  }

  class RProxy[U <: AST]( var target:PARSER[U]=null ) extends PARSER[U] {
    override def apply(ptr: POINTER): Option[U] = {
      require(ptr!=null)
      val trgt = target
      if( trgt==null ) throw new IllegalStateException("target not set")
      trgt(ptr)
    }
  }

  val expr = new RProxy[AST]()

  val brOpen : PARSER[AST] = SpecChar.BrOpen
  val brClose : PARSER[AST] = SpecChar.BrClose
  val brAtom = brOpen + expr + brClose ==> ( (bOpen, e, bClose) => e  )
  val atom = ( numAst | brAtom ) ==> ( e=>e )
  val mulOp = binaryOp[AST]( operator(Op.MUL, Op.DIV), atom, atom,
    i => new BinaryOp(i),
    (left, o, right) => new BinaryOp(left,right=Some(o,right))
  )
  val sumOp = binaryOp[AST]( operator(Op.ADD, Op.SUB), mulOp, mulOp,
    i => new BinaryOp(i),
    (left, o, right) => new BinaryOp(left,right=Some(o,right))
  )

  expr.target = sumOp

  def main(args:Array[String]):Unit = {
    def t1()= {
      val tokens = Tokenizer.tokens("12 + 45.56 - 23.8", List(number3, ws, operatorToken), null)
      val tokenList = tokens.toList.filter(x => !x.isInstanceOf[WS])
      tokenList.foreach(tok => println(s"tok $tok"))

      val tokPtr = new LPointer[CToken](0, tokenList)

      println(tokPtr.lookup(0))
      println(numAst(tokPtr))
      println(sumOp(tokPtr))
    }

    def t2()= {
      val tokens = Tokenizer.tokens("1 * 2 + 3 * 4", List(number3, ws, operatorToken), null)
      val tokenList = tokens.toList.filter(x => !x.isInstanceOf[WS])
      tokenList.foreach(tok => println(s"tok $tok"))

      val tokPtr = new LPointer[CToken](0, tokenList)
      println( expr(tokPtr) )
    }

    t2
  }
}
