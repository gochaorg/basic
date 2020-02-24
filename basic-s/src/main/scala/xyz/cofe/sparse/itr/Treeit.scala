package xyz.cofe.sparse.itr

object Treeit {
  def tree1[A]( start:Seq[A], follow: Function1[A,Seq[A]] ):Iterable[TreeStep[A]] = {
    require(start!=null)
    require(follow!=null)
    new Iterable[TreeStep[A]]{
      override def iterator: Iterator[TreeStep[A]] = {
        new TreeIterator[A](start,follow)
      }
    }
  }

  def tree[A]( start:A, follow: Function1[A,Seq[A]] ):Iterable[TreeStep[A]] = {
    require(start!=null)
    require(follow!=null)
    tree1(List(start),follow)
  }
}
