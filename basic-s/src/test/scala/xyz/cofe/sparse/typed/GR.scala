package xyz.cofe.sparse.typed

import xyz.cofe.sparse.{Pointer, Tok}

// Некое грамматическое правило
trait GR[P <: Pointer[_,_,_],T <: Tok[P]] extends Function1[P,Option[T]] {}