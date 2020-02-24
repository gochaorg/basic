package xyz.cofe.sparse

object ChainBuilder {
  implicit class BaseFn[P <: Pointer[_,_,_], T <: Tok[P]](base: GrammarOp[P,T]) {
    require(base!=null)
    def +( parser: GrammarOp[P,T] ) : SeqBuilder[P,T] = {
      require(parser!=null)
      new SeqBuilder[P,T]( List(base,parser) )
    }
    def *( n:Int ) : RepBuilder[P,T] = {
      new RepBuilder[P,T]( base ).min(n)
    }
    def *( minMax:(Int,Int) ) : RepBuilder[P,T] = {
      require(minMax!=null)
      new RepBuilder[P,T](base).min(minMax._1).max(minMax._2)
    }
    def |( parser:GrammarOp[P,T] ) : Alternatives[P,T] = {
      require(parser!=null)
      new Alternatives[P,T](List(base,parser))
    }
    def +( rep: RepBuilder[P,T] ):SeqBuilder[P,T] = {
      new SeqBuilder[P,T]( List(base,rep.expr) )
    }
    def +( rep: SeqBuilder[P,T] ):SeqBuilder[P,T] = {
      new SeqBuilder[P,T]( List(base).appendedAll(rep.expr) )
    }
  }

  class SeqBuilder[P <: Pointer[_,_,_], T <: Tok[P]]( val expr: Seq[GrammarOp[P,T]] ){
    def ==> ( fn: (P,P,Seq[T]) => T ) : Sequence[P,T] = {
      require(fn!=null)
      new Sequence[P,T](expr, fn)
    }
    def ==> ( fn: (P,P) => T ) : Sequence[P,T] = {
      require(fn!=null)
      new Sequence[P,T](expr, (b,e,t)=>fn(b,e) )
    }
  }
  implicit class SeqFn[P <: Pointer[_,_,_], T <: Tok[P]](base:Sequence[P,T]) extends BaseFn(base) {
    def ==> ( fn: (P,P,Seq[T]) => T ) : Sequence[P,T] = {
      require(fn!=null)
      base.build( fn )
    }
    def ==> ( fn: (P,P) => T ) : Sequence[P,T] = {
      require(fn!=null)
      base.build( fn )
    }
  }

  class RepBuilder[P <: Pointer[_,_,_], T <: Tok[P]]( val expr: GrammarOp[P,T], min:Option[Int]=None, max:Option[Int]=None ){
    def min(n:Int):RepBuilder[P,T] = {
      new RepBuilder[P,T](expr,Some(n),max)
    }
    def max(n:Int):RepBuilder[P,T] = {
      new RepBuilder[P,T](expr,min,Some(n))
    }
    def ==> ( fn: (P,P,Seq[T]) => T ) : Repeat[P,T] = {
      require(fn!=null)
      new Repeat[P,T](expr,fn,
        min.getOrElse(1),max.getOrElse(Int.MaxValue))
    }
    def ==> ( fn: (P,P) => T ) : Repeat[P,T] = {
      require(fn!=null)
      new Repeat[P,T](expr,(b,e,t)=>fn(b,e),
        min.getOrElse(1),max.getOrElse(Int.MaxValue))
    }
  }

  implicit class RepFn[P <: Pointer[_,_,_], T <: Tok[P]](base:Repeat[P,T]) extends BaseFn(base) {
    def ==> ( fn: (P,P,Seq[T]) => T ) : Repeat[P,T] = {
      require(fn!=null)
      base.build( fn )
    }
    def ==> ( fn: (P,P) => T ) : Repeat[P,T] = {
      require(fn!=null)
      base.build( fn )
    }
  }
}
