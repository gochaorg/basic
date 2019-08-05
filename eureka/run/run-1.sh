#!/bin/bash

THIS_DIR=$(readlink -f $(dirname $0))
JAR_DIR=$(readlink -f $THIS_DIR/..)
# echo $THIS_DIR
# echo $JAR_DIR

JAR_FILE=$JAR_DIR/target/eureka-sample-0.0.1-SNAPSHOT.jar
echo "Run first eureka"
java -jar $JAR_FILE --spring.config.location=$THIS_DIR/application-1.yml