package xyz.cofe.sparse

import scala.reflect.ClassTag

/**
  * Последовательность правил в выражении грамматики
  *
  * @tparam P указатель на текущуу позицию
  * @tparam T тип лексемы
  */
class Sequence[P <: Pointer[_,_,_], T <: Tok[P]]
(
  // Последовательность правил
  val expressions : Seq[GrammarOp[P,T]]

  // Функция построения результата
  ,val builder: Function3[P,P,Seq[T],T] //= (begin:P,tend:P,toks:Seq[T]) => new Dummy[P](tend).asInstanceOf[T]
) extends GrammarOp[P,T]
{
  require(expressions!=null)

  def build( fn: (P,P,Seq[T]) => T ):Sequence[P,T] = {
    require(fn!=null)
    new Sequence[P,T](expressions, fn)
  }

  def build( fn: (P,P) => T ):Sequence[P,T] = {
    require(fn!=null)
    new Sequence[P,T](expressions, ((b, e, t)=>fn(b,e)) )
  }

  override def apply(ptr: P): Option[T] = {
    require(ptr!=null,"ptr is null")

    var matched : List[T] = List()
    val beginPointer = ptr

    var p = ptr
    var fail = false

    if( expressions==null ){
      fail = true
    }else {
      expressions.foreach { case (e) =>
        if (e != null && !fail) {
          val t = e.apply(p)
          if (t.isEmpty) {
            fail = true
          } else {
            val nextP = t.get.end()
            if (p >= nextP) {
              throw new Error("parser return empty token")
            }
            p = nextP
            matched = t.get :: matched
          }
        }
      }
    }

    if( fail || matched.isEmpty ){
      None
    }else{
      val endPointer = matched(0).end()
      if( beginPointer >= endPointer )throw new Error("parser catch empty token")

      matched = matched.reverse
      if( builder!=null ) {
        Some(builder.apply(beginPointer, endPointer, matched))
      }else{
        None
      }
    }
  }

  override def nestedGOPs(): Seq[GrammarOp[P, T]] = expressions
}
