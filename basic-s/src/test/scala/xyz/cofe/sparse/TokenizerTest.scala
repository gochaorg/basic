package xyz.cofe.sparse

import org.scalatest.FunSuite

object TokenizerTest {
  val idParser = new Sequence[CharPointer,CharToken](
    Seq(
      Chars.Letter,
      new Repeat[CharPointer,CharToken](Chars.LetterOrDigit, (begin,end,toks)=>new CharToken(begin,end) )
    ),
    (begin,end,toks) => new CharToken(begin,end)
  )

  case class Whitespace( begin1: CharPointer, end1: CharPointer) extends CharToken( begin1, end1 )

  val whitespaceParser = new Repeat[CharPointer,CharToken]( Chars.Whitespace, (begin,end,toks) => Whitespace(begin,end) )

  def main(args:Array[String]):Unit = {
    val tokens = Tokenizer.tokens("  abc a12", whitespaceParser :: idParser :: Nil)
    tokens.foreach(t => println(s"tok = $t"))
  }
}
