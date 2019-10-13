import express = require('express');
import { cmdline } from 'ts-cmdline-prsr/cmdline';
import eu = require( 'ts-basic-eureka-client/EurekaClient' );
import os = require( 'os' )
import * as srv from './srv';

const conf : srv.appConfig & eu.ClientConfig = {
    server: {
        port: 3000,
        ip: '0.0.0.0'
    },

    eureka: {
        api: ['http://localhost:8701/eureka','http://localhost:8702/eureka']
    },

    registry: {
        app: 'srvc1',
        hostName: 'localhost',
        ipAddr: '127.0.0.1',
        port: 3000,
        homePageUrl: 'http://localhost:3000/',
        status: "UP"
    }
}

const cl = new cmdline()
cl.matchAll({
    "-server.port" : { int: port => { conf.server.port = port } },
    "-server.ip" : { str: ip => conf.server.ip = ip },
    "-eu.add" : { str: addr=>{ conf.eureka.api.push(addr) } },
    "-eu.set" : { str: addr=>{ conf.eureka.api = [addr] } },
    "-app.name" : { str: name=> { 
            if( conf.registry ){
                conf.registry.app = name
            }
        } 
    },
    "-show" : {
        str: (key) => {
            switch( key ){
                case 'netItfs':
                    console.log( os.networkInterfaces() )
                    break;
            }
        }
    },
    "run" : { keyOnly: startExpress }
})

/** старт сервера */
function startExpress() {
    srv.start( conf )
}

/** обработка выхода */
const onExit = ()=>{
    console.log("on exit")
    srv.stop()
}

process.on( "exit", onExit )
process.on( "SIGINT", onExit )
process.on( "SIGUSR1", onExit )
process.on( "SIGUSR2", onExit )
