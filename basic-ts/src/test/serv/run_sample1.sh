#!/bin/bash

THIS_DIR=$(readlink -f $(dirname $0))
BASE_DIR=$(readlink -f $THIS_DIR/../../..)
START_JS=$(readlink -f $BASE_DIR/out/ts/serv/sample1.js)

function start_sample1()
{    
    node $START_JS -port 3001 -sleep.min 200 -sleep.max 1000 -fail.pct 20 2>&1 >sample-1.log &
    SERVICE_PID1=$!
    echo "First SERVICE pid = $SERVICE_PID1"

    node $START_JS -port 3002 -sleep.min 20 -sleep.max 300 -fail.pct 60 2>&1 >sample-2.log &
    SERVICE_PID2=$!
    echo "Second SERVICE pid = $SERVICE_PID2" 
}

function stop_sample1(){
    kill -9 $SERVICE_PID1
    kill -9 $SERVICE_PID2
}

function main(){
    start_sample1

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

    stop_sample1
}

main