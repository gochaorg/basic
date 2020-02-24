package xyz.cofe.sparse

/**
  * Проработка списка DSL для описания правил
  */
object ChainRule2 {
  // Некое грамматическое правило
  trait GR[P <: Pointer[_,_,_],T <: Tok[P]] extends Function1[P,Option[T]] {}

  case class CToken( val begin : CharPointer, val end : CharPointer ) extends Tok[CharPointer] {
    lazy val text = {
      begin.text( end.pointer() - begin.pointer() )
    }
  };
  def ctest( cond:Char=>Boolean ):GR[CharPointer,CToken] = {
    (ptr) => {
      if( ptr.eof() ){
        None
      }else{
        if( cond(ptr.lookup(0).get) ){
          Some( CToken(ptr,ptr.move(1)) )
        }else{
          None
        }
      }
    }
  }

  val Letter = ctest( Character.isLetter(_) );
  val LetterOrDigit = ctest( Character.isLetterOrDigit(_) );
  val Digit = ctest( Character.isDigit(_) );
  val Dot = ctest( c => c=='.' );
  val Whitespace = ctest( Character.isWhitespace(_) );

  trait GOP[P <: Pointer[_,_,_],T <: Tok[P]] {
  }
  trait SqBase[P <: Pointer[_,_,_],T <: Tok[P]] extends GOP[P,T] {
    val expr:GR[P,T]
  }
  trait Sq2[P <: Pointer[_,_,_],T1 <: Tok[P], T2 <: Tok[P]] {
    val base:GR[P,T1]
    val next:GR[P,T2]
  }
  trait Sq3[P <: Pointer[_,_,_],T1 <: Tok[P], T2 <: Tok[P], T3 <: Tok[P]] {
    val prev:Sq2[P,T1, T2]
    val next:GR[P,T3]
  }

  trait Sq[P <: Pointer[_,_,_],T <: Tok[P]] extends GOP[P,T] {
    val exprs:Seq[GR[P,T]]
  }
  trait Rp[P <: Pointer[_,_,_],T <: Tok[P]] extends GOP[P,T] {
    val expr:GR[P,T]
    val min:Int
    def ==>[U <: T]( fn:(Seq[T]=>U) ):GR[P,U] = {
      new GR[P,U]{
        override def apply(ptr: P): Option[U] = {
          if( ptr.eof() ){
            None
          }else{
            var p = ptr
            var ml = List[T]()
            var stop = false
            while( !stop ){
              val m = expr.apply(p)
              m match {
                case None => stop=true
                case Some(t) => {
                  ml = t :: ml
                  p = t.end()
                }
              }
              if( p.eof() ){
                stop = true
              }
            }

            if( ml.size >= min ){
              Some( fn( ml.reverse ) )
            }else{
              None
            }
          }
        }
      }
    }
  }
  trait Al[P <: Pointer[_,_,_],T <: Tok[P]] extends GOP[P,T] {
    val expr:Seq[GR[P,T]]
  }

  implicit class GR2GOP[P <: Pointer[_,_,_],T <: Tok[P]]( val base1:GR[P,T] ){
    def +[U <: Tok[P]]( g:GR[P,U] ):Sq2[P,T, U] = {
      new Sq2[P,T, U] {
        override val base: GR[P, T] = base1
        override val next: GR[P, U] = g
      }
    }
    def *( n:Int ):Rp[P,T] = {
      new Rp[P,T] {
        override val expr: GR[P,T] = base1
        override val min: Int = n
      }
    }
    def |( g:GR[P,T] ):Al[P,T] = {
      new Al[P,T] {
        override val expr: Seq[GR[P, T]] = List(base1,g)
      }
    }
  }

  implicit class Sq2GOP[P <: Pointer[_,_,_],T1 <: Tok[P],T2 <: Tok[P],T <: Tok[P]]( val base:Sq2[P,T1,T2] ){
    def +[U <: Tok[P]]( gop:GR[P,U] ):Sq3[P,T1,T2,U] = {
      new Sq3[P,T1, T2, U] {
        override val prev: Sq2[P, T1, T2] = base
        override val next: GR[P, U] = gop
      }
    }
  }
  implicit class Sq3GOP[P <: Pointer[_,_,_],T <: Tok[P],T1 <: Tok[P],T2 <: Tok[P],T3 <: Tok[P]]( val base:Sq3[P,T1,T2,T3] ){
    def ==>[U <: Tok[P]](f: (T1, T2, T3) => U): GR[P, U] = {
      new GR[P, U] {
        override def apply(ptr: P): Option[U] = {
          var res : Option[U] = None
          val v1 = base.prev.base.apply(ptr)
          if( v1.nonEmpty ) {
            val v2 = base.prev.next.apply(v1.get.end())
            if (v2.nonEmpty) {
              val v3 = base.next.apply(v2.get.end())
              if( v2.nonEmpty ){
                res = Some( f(v1.get, v2.get, v3.get) )
              }
            }
          }
          res
        }
      }
    }
  }

  val numRep = Digit*1

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
  val digits = numRep ==> (new Digits(_))

  class Num( val left:Digits, val right:Digits ) extends CToken( left.begin, right.end ) {
    override def toString: String = s"Num l=$left r=$right"
  };

  val num = (digits + Dot + digits) ==> (
    (d1, dot, d2)=> new Num( d1, d2 )
  );

  class WS( b1: CharPointer, e1: CharPointer ) extends CToken(b1,e1);

//  val ws = Whitespace * 1 ==> WS;

  def main(args:Array[String]):Unit = {
    val cptr = new BasicCharPointer(0,"1234")
    val digit = digits(cptr)
    println( digit )

    val cptr2 = new BasicCharPointer(0,"123.34")
    val num1 = num(cptr2);
    println( num1 )
  }
}
