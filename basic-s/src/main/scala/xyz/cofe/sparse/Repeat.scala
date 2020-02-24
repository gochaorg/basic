package xyz.cofe.sparse

/**
  * Повтор правила несколько раз подряд
  *
  * @tparam P указатель на текущуу позицию
  * @tparam T тип лексемы
  */
class Repeat[P <: Pointer[_,_,_], T <: Tok[P]]
(
  // Правило
  val expression : GrammarOp[P,T]

  // Построение результата
  ,val builder: Function3[P,P,Seq[T],T] // = (begin:P,tend:P,toks:Seq[T]) => new Dummy[P](tend).asInstanceOf[T]

  // Минимальное кол-во повторов
  ,val min:Int = 1

  // Максимальное кол-во повторов
  ,val max:Int = Int.MaxValue

  // "Жадный" - true - захватывать по максимому
  ,val greedly:Boolean = true
) extends GrammarOp[P,T]
{
  require(expression!=null,"expression is null")
  require(builder!=null,"builder is null")

  def min(n:Int) : Repeat[P,T] = new Repeat[P,T]( expression, builder, n, max, greedly )
  def max(n:Int) : Repeat[P,T] = new Repeat[P,T]( expression, builder, min, n, greedly )
  def greedly(g:Boolean) : Repeat[P,T] = new Repeat[P,T]( expression, builder, min, max, g )

  def build( fn:(P,P,Seq[T])=>T ):Repeat[P,T] = {
    require(fn!=null)
    new Repeat[P,T](expression, fn, min, max, greedly )
  }

  def build( fn: (P,P) => T ):Repeat[P,T] = {
    require(fn!=null)
    new Repeat[P,T](expression, ((b,e,t)=>fn(b,e)), min, max, greedly )
  }

  override def apply(ptr: P): Option[T] = {
    require(ptr!=null,"ptr is null")

    var matched : List[T] = List()
    val beginPointer = ptr

    var p = ptr
    var fail = false
    var stop = false

    while( !(fail || stop) ){
      if( p.eof() ){
        stop = true
      }else{
        if( max>0 && matched.size >= max ){
          stop = true
        }else{
          val t = expression.apply(p)
          if( t.isEmpty ){
            stop = true
          }else{
            val nextP = t.get.end()
            if( p >= nextP ){
              throw new Error("parser return empty token")
            }else{
              matched = t.get :: matched
              p = nextP
              if( !greedly && matched.size>=min ){
                stop = true
              }
            }
          }
        }
      }
    }

    if( fail ){
      None
    }else {
      if( min>0 && matched.size < min ){
        None
      }else {
        Some( builder( beginPointer, matched(0).end(), matched.reverse ) )
      }
    }
  }

  override def nestedGOPs(): Seq[GrammarOp[P, T]] = List(expression)
}
