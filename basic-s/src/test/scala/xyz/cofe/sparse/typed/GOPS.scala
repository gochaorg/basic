package xyz.cofe.sparse.typed

import xyz.cofe.sparse.{Pointer, Tok}

/**
  * Грамматические правила
  */
object GOPS {

  /**
    * Грамматическая конструкция
    * @tparam P Тип указателя
    * @tparam T Тип токена
    */
  trait GOP[P <: Pointer[_,_,_],T <: Tok[P]] {
  }

  /**
    * Последоваетльность грамматических конструкций из двух t1, t2
    * @tparam P  Тип указателя
    * @tparam T1 Тип первго токена
    * @tparam T2 Тип второго токена
    */
  trait Sq2[P <: Pointer[_,_,_],T1 <: Tok[P], T2 <: Tok[P]] {
    val t1:GR[P,T1]
    val t2:GR[P,T2]
    def +[U <: Tok[P]]( gop:GR[P,U] ):Sq3[P,T1,T2,U] = {
      val self = this
      new Sq3[P,T1, T2, U] {
        override val prev: Sq2[P, T1, T2] = self
        override val t3: GR[P, U] = gop
      }
    }
    def ==>[U <: Tok[P]](f: (T1, T2) => U): GR[P, U] = {
      val self = this
      new GR[P, U] {
        override def apply(ptr: P): Option[U] = {
          var res : Option[U] = None
          val v1 = self.t1.apply(ptr)
          if( v1.nonEmpty ) {
            val v2 = self.t2.apply(v1.get.end())
            if (v2.nonEmpty) {
              res = Some( f(v1.get, v2.get) )
            }
          }
          res
        }
      }
    }
  }

  /**
    * Последоваетльность грамматических конструкций из трех t1, t2, t3
    * @tparam P  Тип указателя
    * @tparam T1 Тип первго токена
    * @tparam T2 Тип второго токена
    * @tparam T3 Тип третьего токена
    */
  trait Sq3[P <: Pointer[_,_,_],T1 <: Tok[P], T2 <: Tok[P], T3 <: Tok[P]] {
    val prev:Sq2[P,T1, T2]
    lazy val t1:GR[P,T1] = prev.t1
    lazy val t2:GR[P,T2] = prev.t2
    val t3:GR[P,T3]
    def +[U <: Tok[P]]( gop:GR[P,U]):Sq4[P,T1,T2,T3,U] = {
      val self = this
      new Sq4[P,T1,T2,T3,U]{
        override val prev: Sq3[P, T1, T2, T3] = self
        override val t4: GR[P, U] = gop
      }
    }
    def ==>[U <: Tok[P]](f: (T1, T2, T3) => U): GR[P, U] = {
      val self = this
      new GR[P, U] {
        override def apply(ptr: P): Option[U] = {
          var res : Option[U] = None
          val v1 = self.t1.apply(ptr)
          if( v1.nonEmpty ) {
            val v2 = self.t2.apply(v1.get.end())
            if (v2.nonEmpty) {
              val v3 = self.t3.apply(v2.get.end())
              if( v3.nonEmpty ){
                res = Some( f(v1.get, v2.get, v3.get) )
              }
            }
          }
          res
        }
      }
    }
  }

  /**
    * Последоваетльность грамматических конструкций из четырех t1, t2, t3, t4
    * @tparam P  Тип указателя
    * @tparam T1 Тип первго токена
    * @tparam T2 Тип второго токена
    * @tparam T3 Тип третьего токена
    * @tparam T4 Тип 4-го токена
    */
  trait Sq4[P <: Pointer[_,_,_],T1 <: Tok[P], T2 <: Tok[P], T3 <: Tok[P], T4 <: Tok[P]] {
    val prev:Sq3[P,T1, T2, T3]
    lazy val t1:GR[P,T1] = prev.t1
    lazy val t2:GR[P,T2] = prev.t2
    lazy val t3:GR[P,T3] = prev.t3
    val t4:GR[P,T4]
    def +[U <: Tok[P]]( gop:GR[P,U]):Sq5[P,T1,T2,T3,T4,U] = {
      val self = this
      new Sq5[P,T1,T2,T3,T4,U]{
        override val prev: Sq4[P, T1, T2, T3, T4] = self
        override val t5: GR[P, U] = gop
      }
    }
    def ==>[U <: Tok[P]](f: (T1, T2, T3, T4) => U): GR[P, U] = {
      val self = this
      new GR[P, U] {
        override def apply(ptr: P): Option[U] = {
          var res : Option[U] = None
          val v1 = self.t1.apply(ptr)
          if( v1.nonEmpty ) {
            val v2 = self.t2.apply(v1.get.end())
            if (v2.nonEmpty) {
              val v3 = self.t3.apply(v2.get.end())
              if( v3.nonEmpty ){
                val v4 = self.t4.apply(v3.get.end())
                if( v4.nonEmpty ) {
                  res = Some(f(v1.get, v2.get, v3.get, v4.get))
                }
              }
            }
          }
          res
        }
      }
    }
  }

  /**
    * Последоваетльность грамматических конструкций из четырех t1, t2, t3, t4
    * @tparam P  Тип указателя
    * @tparam T1 Тип первго токена
    * @tparam T2 Тип второго токена
    * @tparam T3 Тип третьего токена
    * @tparam T4 Тип 4-го токена
    */
  trait Sq5[
      P <: Pointer[_,_,_],
      T1 <: Tok[P],
      T2 <: Tok[P],
      T3 <: Tok[P],
      T4 <: Tok[P],
      T5 <: Tok[P]
  ] {
    val prev:Sq4[P,T1, T2, T3, T4]
    lazy val t1:GR[P,T1] = prev.t1
    lazy val t2:GR[P,T2] = prev.t2
    lazy val t3:GR[P,T3] = prev.t3
    lazy val t4:GR[P,T4] = prev.t4
    val t5:GR[P,T5]
    def ==>[U <: Tok[P]](f: (T1, T2, T3, T4, T5) => U): GR[P, U] = {
      val self = this
      new GR[P, U] {
        override def apply(ptr: P): Option[U] = {
          var res : Option[U] = None
          val v1 = self.t1.apply(ptr)
          if( v1.nonEmpty ) {
            val v2 = self.t2.apply(v1.get.end())
            if (v2.nonEmpty) {
              val v3 = self.t3.apply(v2.get.end())
              if( v3.nonEmpty ){
                val v4 = self.t4.apply(v3.get.end())
                if( v4.nonEmpty ) {
                  val v5 = self.t5.apply(v4.get.end())
                  if( v5.nonEmpty ) {
                    res = Some(f(v1.get, v2.get, v3.get, v4.get, v5.get))
                  }
                }
              }
            }
          }
          res
        }
      }
    }
  }

  /**
    * Повтор грамматических конструкций
    * @tparam P  Тип указателя
    * @tparam T Тип токена
    */
  trait Rp[P <: Pointer[_,_,_],T <: Tok[P]] extends GOP[P,T] {
    val expr:GR[P,T]
    val min:Int

    /**
      * Парсинг последовательности токенов
      * @param ptr указатель на входную последовательность токенов
      * @return совпавшие токены
      */
    def parse(ptr:P):Option[(P,P,Seq[T])] = {
      if( ptr.eof() ){
        None
      }else {
        val begin = ptr
        var end = ptr
        var p = ptr
        var ml = List[T]()
        var stop = false
        while (!stop) {
          val m = expr.apply(p)
          m match {
            case None => stop = true
            case Some(t) => {
              ml = t :: ml
              p = t.end()
              end = p
            }
          }
          if (p.eof()) {
            stop = true
          }
        }

        if (ml.size >= min) {
          Some((begin, end, ml.reverse))
        } else {
          None
        }
      }
    }

    /**
      * Преобразование в грамматическую конструкцию
      * @param fn Преобразование совпадений
      * @tparam U Тип токена
      * @return грамматическая конструкция
      */
    def ==>[U <: T]( fn:(Seq[T]=>U) ):GR[P,U] = {
      new GR[P,U]{
        override def apply(ptr: P): Option[U] = {
          val res = parse(ptr)
          if( res.isEmpty ){
            None
          }else{
            Some( fn(res.get._3) )
          }
        }
      }
    }

    /**
      * Преобразование в грамматическую конструкцию
      * @param fn Преобразование совпадений
      * @tparam U Тип токена
      * @return грамматическая конструкция
      */
    def ==>[U <: T]( fn:(P,P)=>U ):GR[P,U]={
      new GR[P,U]{
        override def apply(ptr: P): Option[U] = {
          val res = parse(ptr)
          if( res.isEmpty ){
            None
          }else{
            Some( fn(res.get._1, res.get._2) )
          }
        }
      }
    }
  }

  /**
    * Альтернативная грамматическая конструкция
    * @tparam P Тип указателя
    * @tparam T Тип токена
    */
  trait Al[P <: Pointer[_,_,_],T <: Tok[P]] extends GOP[P,T] {
    val expr:Seq[GR[P,T]]
    def ==>[U <: Tok[P]]( f:T=>U ): GR[P,U] ={
      new GR[P,U]{
        override def apply(ptr: P): Option[U] = {
          var r:Option[T] = None
          expr.foreach( ex => {
            if( r.isEmpty ){
              r = ex(ptr)
            }
          })
          if( r.isEmpty ){
            None
          }else{
            Some( f(r.get) )
          }
        }
      }
    }
  }

  implicit class GR2GOP[P <: Pointer[_,_,_],T <: Tok[P]]( val base1:GR[P,T] ){
    def +[U <: Tok[P]]( g:GR[P,U] ):Sq2[P,T, U] = {
      new Sq2[P,T, U] {
        override val t1: GR[P, T] = base1
        override val t2: GR[P, U] = g
      }
    }
    def *( n:Int ):Rp[P,T] = {
      new Rp[P,T] {
        override val expr: GR[P,T] = base1
        override val min: Int = n
      }
    }
    def |( g:GR[P,T] ):Al[P,T] = {
      new Al[P,T] {
        override val expr: Seq[GR[P, T]] = List(base1,g)
      }
    }
  }
}
