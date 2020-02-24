package xyz.cofe.sparse

/**
  * Различные классы символов
  */
object Chars {
  /**
    * Любой символ
    */
  val Any : CharParser = test("Any", _ => true)

  /**
    * Пробельный символ
    */
  val Whitespace : CharParser = test( "Whitespace", Character.isWhitespace(_) )

  /** Символ a..zA..Zа..яА..Я */
  val Letter : CharParser = test( "Letter", Character.isLetter(_) )

  /** Символ a..zA..Zа..яА..Я */
  val Digit : CharParser = test( "Digit", Character.isDigit(_) )

  /** Символ a..zA..Zа..яА..Я или 0..9 */
  val LetterOrDigit : CharParser = test( "LetterOrDigit", Character.isLetterOrDigit(_) )

  /**
    * Именновая функция распознования символа
    * @param name имя
    * @param cond функция
    */
  class CharParser( val name:String, val cond:Char=>Boolean ) extends GrammarOp[CharPointer,CharToken] {
    require(name!=null)
    require(cond!=null)

    override def nestedGOPs(): Seq[GrammarOp[CharPointer, CharToken]] = List()
    override def apply(ptr: CharPointer): Option[CharToken] = {
      if( ptr.eof() ){
        None
      }else{
        val c = ptr.lookup(0)
        if( c.nonEmpty ){
          if( cond(c.get) ){
            Some(new CharToken(ptr,ptr.move(1)))
          }else{
            None
          }
        }else{
          None
        }
      }
    }

    override def toString(): String = s"Char $name"
  }

  /**
    * Создание функции проверки
    * @param name Имя лексемы
    * @param cond функции проверки
    * @return парсер
    */
  def test( name:String, cond:Char=>Boolean ):CharParser = {
    require(name!=null)
    require(cond!=null)
    new CharParser(name,cond)
  }
}
