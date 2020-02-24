package xyz.cofe.sparse

object RuleBuilderTest {
  import RuleBuilder._;

  case class Id ( begin1: CharPointer, end1: CharPointer) extends CharToken( begin1, end1 );

  val id = seqs(
    Chars.Letter, rep(Chars.LetterOrDigit).build(
      (b,e,t) => new CharToken(b,e)
    )
  ).build( (b,e,t) => new Id(b,e) )

  case class Whitespace ( begin1: CharPointer, end1: CharPointer) extends CharToken( begin1, end1 );

  val ws = rep( Chars.Whitespace ).build( (b,e,t) => new Whitespace(b,e) )

//  implicit class BldFn[P <: Pointer[_,_,_], T <: Tok[P]](base:Function1[P,Option[T]]) {
//    def +( parser:Function1[P,Option[T]] ) : Sequence[P,T] = {
//      seqs(base, parser).build( (b,e,t) => new T { def end() = e } )
//    }
//
//    def *( n:Int ) : Repeat[P,T] = {
//      rep(base).build( (b,e,t) => new T { def end() = e } ).min(n)
//    }
//
//    def *( minMax:(Int,Int) ) : Repeat[P,T] = {
//      rep(base).build( (b,e,t) => new T { def end() = e } ).min(minMax._1).max(minMax._2)
//    }
//  }
//
//  implicit class SeqBldFn[P <: Pointer[_,_,_], T <: Tok[P]](base:Sequence[P,T]) extends BldFn[P,T](base) {
//    def ==> ( b: (P,P,Seq[T]) => T ) = {
//      seq(base.expresssions).build(b)
//    }
//  }

//  var id2 = Chars.Letter + Chars.LetterOrDigit*1 ==>( (b,e,t)=>new Id(b,e) )

  def main(args:Array[String]):Unit = {
    val tokens = Tokenizer.tokens("  abc a12", ws :: id :: Nil)
    tokens.foreach(t => println(s"tok = $t"))
  }
}
