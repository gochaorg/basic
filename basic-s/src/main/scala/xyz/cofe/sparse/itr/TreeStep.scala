package xyz.cofe.sparse.itr

trait TreeStep[A] {
  def follow(f:A):TreeStep[A]
  val node:A
  val parent:Option[TreeStep[A]]
  lazy val nodePath : List[A] = {
    var ls : List[A] = List()
    var n = this
    while ( n!=null ){
      ls = n.node :: ls
      n = n.parent.getOrElse(null)
    }
    ls
  }
  lazy val level = nodePath.size
}

object TreeStep {
  def apply[A](a:A): TreeStep[A] = new TreeStepImpl[A](a)
}