package xyz.cofe.sparse.itr

class TreeStepImpl[A](val node:A, val parent:Option[TreeStep[A]]=None ) extends TreeStep[A] {
  def follow(f:A):TreeStep[A]={
    new TreeStepImpl[A](f, Some(this))
  }
}