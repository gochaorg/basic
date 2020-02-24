package xyz.cofe.sparse.typed

import xyz.cofe.sparse.{BasicCharPointer, CharPointer, Pointer, Tok}

class Tokenizer[P <: Pointer[_,_,_],T <: Tok[P]](val ptr:P, val parsers:Seq[GR[P,_ <: T]], val none:T) extends Iterable[T] {
  override def iterator: Iterator[T] = new Iterator[T] {
    def fetch(p:P):(P,Option[T]) = {
      var r:Option[T] = None
      var np = p
      parsers.foreach( prs=>{
        if( r.isEmpty ){
          r = prs(p)
          if( r.nonEmpty ){
            np = r.get.end()
          }
        }
      })
      (np,r)
    }
    var fetched = fetch(ptr)
    override def hasNext: Boolean = fetched._2.nonEmpty
    override def next(): T = {
      if( fetched._2.nonEmpty ){
        val r = fetched._2.get
        fetched = fetch(fetched._1)
        r
      }else{
        none
      }
    }
  }
}

object Tokenizer {
  def tokens[P <: Pointer[_,_,_],T <: Tok[P]]( ptr:P, parsers:Seq[GR[P,_ <: T]], none:T ):Tokenizer[P,T] = {
    require(ptr!=null)
    require(parsers!=null)
    new Tokenizer[P,T](ptr,parsers,none)
  }
  def tokens[T <: Tok[CharPointer]](offset: Int, text:String, parsers:Seq[GR[CharPointer,_ <: T]], none:T ):Tokenizer[CharPointer,T] = {
    require(offset>=0)
    require(text!=null)
    require(parsers!=null)
    val ptr : CharPointer = new BasicCharPointer(offset,text)
    new Tokenizer[CharPointer,T](ptr,parsers,none)
  }
  def tokens[T <: Tok[CharPointer]](text:String, parsers:Seq[GR[CharPointer,_ <: T]], none:T ):Tokenizer[CharPointer,T] = {
    require(text!=null)
    require(parsers!=null)
    tokens(0,text,parsers,none)
  }
}
