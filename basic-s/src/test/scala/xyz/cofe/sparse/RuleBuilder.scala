package xyz.cofe.sparse

/**
  * Построение цепочки правил
  */
object RuleBuilder {
  class SeqBuilder[P <: Pointer[_,_,_], T <: Tok[P]]
  ( exps:Seq[GrammarOp[P,T]]
  ) {
    def build( b: Function3[P,P,Seq[T],T] ):Sequence[P,T] = {
      require(b!=null)
      new Sequence[P,T](exps,b)
    }
  }

  def seq[P <: Pointer[_,_,_], T <: Tok[P]]( exprs:Seq[GrammarOp[P,T]] ) = {
    require(exprs!=null)
    new SeqBuilder[P,T](exprs)
  }

  def seqs[P <: Pointer[_,_,_], T <: Tok[P]]( exprs:GrammarOp[P,T]* )= {
    require(exprs!=null)
    new SeqBuilder[P,T](exprs.toSeq)
  }

  class RepBuilder[P <: Pointer[_,_,_], T <: Tok[P]]
  ( expr:GrammarOp[P,T]
  ) {
    def build( b: Function3[P,P,Seq[T],T] ):Repeat[P,T] = {
      require(b!=null)
      new Repeat[P,T](expr,b)
    }
  }

  def rep[P <: Pointer[_,_,_], T <: Tok[P]](expr:GrammarOp[P,T])={
    require(expr!=null)
    new RepBuilder[P,T](expr)
  }

  class AltBuilder[P <: Pointer[_,_,_], T <: Tok[P]](exps:Seq[GrammarOp[P,T]]){
    def build():Alternatives[P,T] = new Alternatives[P,T](exps)
  }

  def alt[P <: Pointer[_,_,_], T <: Tok[P]]( exps:Seq[GrammarOp[P,T]] )={
    require(exps!=null)
    new AltBuilder[P,T](exps)
  }
}
