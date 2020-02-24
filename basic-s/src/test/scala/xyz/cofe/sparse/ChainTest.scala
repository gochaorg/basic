package xyz.cofe.sparse

object ChainTest {
  // Лексемы
  case class CToken ( begin1: CharPointer, end1: CharPointer) extends CharToken (begin1,end1);
  case class Id ( begin1: CharPointer, end1: CharPointer) extends CharToken( begin1, end1 );
  case class WSpace ( begin1: CharPointer, end1: CharPointer) extends CharToken( begin1, end1 );

  // Построение лексем через перегрузку операторов
  import ChainBuilder._;
  import Chars._;
  import itr.Dump._;

  val idPart = (LetterOrDigit * 1) ==> CToken;
  val id = Letter + idPart ==> Id;
  val ws = Whitespace * 1 ==> WSpace;

  def main(args:Array[String]):Unit = {
    dump(id)

    val tokens = Tokenizer.tokens("  abc a12", ws :: id :: Nil)
    tokens.foreach(t => println(s"tok = $t"))
  }
}
