package xyz.cofe.sparse.typed

import xyz.cofe.sparse.{CharPointer, Tok}

/**
  * Символы
  */
object Chars {
  def ctest( cond:Char=>Boolean ):GR[CharPointer,CToken] = {
    (ptr) => {
      if( ptr.eof() ){
        None
      }else{
        if( cond(ptr.lookup(0).get) ){
          Some( CToken(ptr,ptr.move(1)) )
        }else{
          None
        }
      }
    }
  }

  val Letter = ctest( Character.isLetter(_) );
  val LetterOrDigit = ctest( Character.isLetterOrDigit(_) );
  val Digit = ctest( Character.isDigit(_) );
  val Dot = ctest( c => c=='.' );
  val Whitespace = ctest( Character.isWhitespace(_) );
}
