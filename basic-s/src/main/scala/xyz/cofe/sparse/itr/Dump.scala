package xyz.cofe.sparse.itr

import xyz.cofe.sparse.{GrammarOp, Pointer, Repeat, Sequence, Tok}
import xyz.cofe.sparse.itr.Treeit._;

object Dump {
  def dump( g:GrammarOp[_,_] )= {

    val flw : GrammarOp[_,_] => Seq[GrammarOp[_,_]] = x => x.nestedGOPs()
    val itr = tree( g, flw )
    itr.foreach( ts => {
      val desc = {
        if( ts.node.isInstanceOf[Repeat[_,_]] ){
          val v = ts.node.asInstanceOf[Repeat[_,_]]
          s"Repeat min:${v.min} .. max:${v.max}"
        } else if( ts.node.isInstanceOf[Sequence[_,_]] ){
          "Sequence"
        }
        else {
          s"${ts.node}"
        }
      }

      println(s"${"...|"*(ts.level-1)} ${desc}" )
    })
  }
}
