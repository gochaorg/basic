package xyz.cofe.sparse.typed

import xyz.cofe.sparse.{CharPointer, Tok}

case class CToken( val begin : CharPointer, val end : CharPointer ) extends Tok[CharPointer] {
  lazy val text = {
    begin.text( end.pointer() - begin.pointer() )
  }
}
