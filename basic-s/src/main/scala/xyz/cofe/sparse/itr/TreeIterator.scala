package xyz.cofe.sparse.itr

class TreeIterator[A] ( val start:Seq[A], val follow:A=>Seq[A] ) extends Iterator[TreeStep[A]] {
  require(start!=null)
  require(follow!=null)

  val ws = new scala.collection.mutable.ArrayBuffer[TreeStep[A]]()
  ws.addAll(start.map(TreeStep(_)))

  def nextStep():Option[TreeStep[A]] = {
    if( ws.isEmpty ){
      None
    }else{
      val r = ws.remove(0)
      val flw = follow(r.node)
      var idx = -1
      if( flw!=null ){
        flw.foreach( f => {
          idx += 1;
          ws.insert(idx, r.follow(f));
        }
        )
      }
      Some(r)
    }
  }

  def hasNext()= !ws.isEmpty

  override def next(): TreeStep[A] = {
    val st = nextStep()
    st.getOrElse( null )
  }
}