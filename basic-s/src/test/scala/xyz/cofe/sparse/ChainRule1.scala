package xyz.cofe.sparse

/**
  * Проработка списка DSL для описания правил
  */
object ChainRule1 {
  type P;
  type T;

  // Некое грамматическое правило
  trait GR[P,T] extends Function1[P,Option[T]] {}

  val Letter : GR[P,T] = new GR[P,T] {
    override def apply(v1: P): Option[T] = ???
  };
  val LetterOrDigit : GR[P,T] = new GR[P,T] {
    override def apply(v1: P): Option[T] = ???
  };
  val Digit : GR[P,T] = new GR[P,T] {
    override def apply(v1: P): Option[T] = ???
  };
  val Dot : GR[P,T] = new GR[P,T] {
    override def apply(v1: P): Option[T] = ???
  };
  val Whitespace : GR[P,T] = new GR[P,T] {
    override def apply(v1: P): Option[T] = ???
  };

  trait GOP[P,T] {
  }
  trait Sq[P,T] extends GOP[P,T] {
    val exprs:Seq[GR[P,T]]
  }
  trait Rp[P,T] extends GOP[P,T] {
    val expr:GR[P,T]
    val min:Int
  }
  trait Al[P,T] extends GOP[P,T] {
    val expr:Seq[GR[P,T]]
  }

  implicit class GR2GOP( val base:GR[P,T] ){
    def +( g:GR[P,T] ):Sq[P,T] = {
      new Sq[P,T] {
        override val exprs: Seq[GR[P,T]] = List(base,g)
      }
    }
    def *( n:Int ):Rp[P,T] = {
      new Rp[P,T] {
        override val expr: GR[P,T] = base
        override val min: Int = n
      }
    }
    def |( g:GR[P,T] ):Al[P,T] = {
      new Al[P,T] {
        override val expr: Seq[GR[P, T]] = List(base,g)
      }
    }
  }

  implicit class GOP2GOP( val base:GOP[P,T] ){
    def +( g:GR[P,T] ):Sq[P,T] = {
      new Sq[P,T] {
        override val exprs: Seq[GR[P, T]] = List()
      }
    }
    def +( gop:GOP[P,T] ):Sq[P,T] = {
      new Sq[P,T] {
        override val exprs: Seq[GR[P, T]] = List()
      }
    }
    def |( g:GR[P,T] ):Al[P,T] = {
      new Al[P,T] {
        override val expr: Seq[GR[P, T]] = List()
      }
    }
    def |( g:GOP[P,T] ):Al[P,T] = {
      new Al[P,T] {
        override val expr: Seq[GR[P, T]] = List()
      }
    }
  }

  val numGop : GOP[P,T] = (  (Digit*1) + Dot + (Digit*1)
                       |  (Digit*1)
                       );
}
