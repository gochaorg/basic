package xyz.cofe.sparse.typed

import xyz.cofe.sparse.{BasicCharPointer, CharPointer, Pointer, Tok}

/**
  * Проработка списка DSL для описания правил
  */
object TypedChainRule1 {
  import Chars._;
  import GOPS._;

  class Digits( toks:Seq[CToken] ) extends CToken(toks(0).begin,toks(toks.size-1).end){
    override def toString: String = s"Digit text=$text"
    lazy val len = text.length
    def num(i:Int):Int = {
      require(i>=0)
      require(i<len)
      val c = text.charAt(i)
      c match {
        case '0' => 0; case '1' => 1; case '2' => 2;
        case '3' => 3; case '4' => 4; case '5' => 5;
        case '6' => 6; case '7' => 7; case '8' => 8;
        case '9' => 9;
      }
    }
  };

  val digits = Digit*1 ==> (new Digits(_))

  class Num( val left:Digits, val right:Digits ) extends CToken( left.begin, if( right!=null ){ right.end }else{ left.end } ) {
    lazy val value : Double = {
      var x : Double = 0
      if( left!=null ){
        (0 to left.len-1).foreach( li => {
          val k = Math.pow( 10, left.len-li-1 )
          x = x + k * left.num(li)
        })
        if( right!=null ) {
          (0 to right.len - 1).foreach(li => {
            val k = Math.pow(10, 0 - li -1)
            x = x + k * right.num(li)
          })
        }
      }
      x
    }
    override def toString: String = s"Num value=$value l=$left r=$right"
  };

  val number1 = (digits + Dot + digits) ==> ( (d1, dot, d2)=> new Num( d1, d2 ) );
  val number2 = Digit*1 ==> ( (t) => new Num(new Digits(t), null) );
  val number3 = (number1 | number2) ==> ( t=>t );

  class WS( b1: CharPointer, e1: CharPointer ) extends CToken(b1,e1){
    override def toString: String = "WS"
  };
  val ws = (Whitespace * 1) ==> ( (t) => new WS(t(0).begin, t.last.end));

  def main(args:Array[String]):Unit = {
    val cptr = new BasicCharPointer(0,"1234")
    val digit = digits(cptr)
    println( digit )

    val cptr2 = new BasicCharPointer(0,"123.432")
    println( number1(cptr2) )
    println( number3(cptr2) )
    println( number3(new BasicCharPointer(0,"123")) )

    val tokens = Tokenizer.tokens("12 34 45.56", List(number3, ws), null)
    tokens.foreach( tok => println( s"tok $tok" ) )
  }
}
