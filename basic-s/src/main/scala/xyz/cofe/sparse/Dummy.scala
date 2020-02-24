package xyz.cofe.sparse

class Dummy[P <: Pointer[_,_,_] ]( private val endz: P ) extends Tok[P]
{
  /**
    * Возвращает указатель на конец лексемы
    *
    * @return Указатель
    */
  override def end(): P = endz
}
