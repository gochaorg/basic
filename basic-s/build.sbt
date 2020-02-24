enablePlugins(ScalaJSPlugin)

scalaVersion := "2.13.1" // or any other Scala version >= 2.10.2

// This is an application with a main method
scalaJSUseMainModuleInitializer := true

name := "basic-s"

version := "0.1"

libraryDependencies += "org.scalatest" %% "scalatest" % "3.0.8" % "test"