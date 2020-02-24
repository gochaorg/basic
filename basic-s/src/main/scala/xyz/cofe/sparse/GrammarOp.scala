package xyz.cofe.sparse

trait GrammarOp[P <: Pointer[_,_,_], T <: Tok[P]] extends Function[P,Option[T]] {
  def nestedGOPs() : Seq[GrammarOp[P,T]]
}
