package xyz.cofe.sparse

/**
  * Несколько альтернативных правил
 *
  * @tparam P указатель на текущуу позицию
  * @tparam T тип лексемы
  */
class Alternatives[P <: Pointer[_,_,_], T <: Tok[P]]
(
  // Различные альтернативы правил
  val expresssions : Seq[GrammarOp[P,T]]
) extends Function[P,Option[T]] with GrammarOp[P,T]
{
  require(expresssions!=null,"expressions is null")

  override def apply(ptr: P): Option[T] = {
    require(ptr!=null,"ptr is null")
    if( ptr.eof() || expresssions.isEmpty ){
      None
    }else {
      var matched : Option[T] = None
      expresssions.foreach( e => {
        if( matched.isEmpty ){
          val m = e.apply(ptr)
          if( m.nonEmpty ){
            if( ptr >= m.get.end() )throw new Error("parser return empty token")
            matched = m
          }
        }
      })
      matched
    }
  }

  override def nestedGOPs(): Seq[GrammarOp[P, T]] = expresssions
}
