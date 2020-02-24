package xyz.cofe.sparse

/**
  * Итератор по токенам
  */
object Tokenizer {
  type CharParser = GrammarOp[CharPointer,CharToken]

  /**
    * Создание итератора по токенам
    * @param str Исходный текст
    * @param pos Начальная позиция
    * @param parsers Парсеры токенов
    * @return Токены
    */
  def tokens( str:String, pos:Int, parsers:Seq[CharParser] ):Iterable[CharToken] = {
    require(str!=null,"str is null")
    require(parsers!=null,"parsers is null")

    new Iterable[CharToken](){
      override def iterator: Iterator[CharToken] = {
        var ptr : CharPointer = new BasicCharPointer(pos,str)

        val fetch = ( ptr:CharPointer ) => {
          var matched : Option[CharToken] = None
          parsers.foreach( p => {
            if( matched.isEmpty ){
              val m = p(ptr)
              if( m.nonEmpty ){
                matched = m
              }
            }
          })
          matched
        }

        var tok = fetch(ptr)

        new Iterator[CharToken](){
          override def hasNext: Boolean = tok.nonEmpty
          override def next(): CharToken = {
            if( tok.nonEmpty ){
              val res = tok.get
              ptr = res.end
              tok = fetch(ptr)
              res
            }else{
              null
            }
          }
        }
      }
    }
  }

  /**
    * Создание итератора по токенам
    * @param str Исходный текст
    * @param parsers Парсеры токенов
    * @return Токены
    */
  def tokens( str:String, parsers:Seq[CharParser] ):Iterable[CharToken] = tokens(str,0,parsers)
}
