#!/bin/bash

THIS_DIR=$(readlink -f $(dirname $0))
JAR_DIR=$(readlink -f $THIS_DIR/..)
JAR_FILE=$JAR_DIR/target/eureka-sample-0.0.1-SNAPSHOT.jar

function start_eureka()
{
    java -jar $JAR_FILE --spring.config.location=$THIS_DIR/application-1.yml 2>&1 >eureka-1.log &
    EUREKA_PID1=$!
    echo "First EUREKA pid = $EUREKA_PID1"

    java -jar $JAR_FILE --spring.config.location=$THIS_DIR/application-2.yml 2>&1 >eureka-2.log &
    EUREKA_PID2=$!
    echo "Second EUREKA pid = $EUREKA_PID2" 
}

function stop_eureka(){
    kill -9 $EUREKA_PID1
    kill -9 $EUREKA_PID2
}

start_eureka

echo "wait input command (help):"
STOP=0
EMPTYLINE=0
while [[ "$STOP" == 0 ]] ; do
    read -p ">> " cmd
    if [[ "$cmd" =~ [h(elp)?] ]] ; then
        echo "show help"
    elif [[ "$cmd" =~ [e(xit)?] ]] ; then
        echo "stopping"
        STOP=1
    elif [[ "$cmd" == "" ]] ; then
        EMPTYLINE=$(( $EMPTYLINE + 1 ))
        #echo "empty line $EMPTYLINE"
        if [[ $EMPTYLINE > 1 ]] ; then
            echo "stopping"
            STOP=1
        fi
    else
        echo "unknow command"
    fi
done

stop_eureka