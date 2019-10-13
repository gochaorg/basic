import express = require('express');
import http = require('http');
import eu = require( 'ts-basic-eureka-client/EurekaClient' );

/**
 * создание promise для задержки
 * @param ms величина задержки (мс)
 */
async function msleep(ms:number) {
    return new Promise<any>( (resolve,reject)=>{
        setTimeout(resolve,ms)
    })
}

/**
 * Задержка на указанное кол-во мсекунд
 * @param msec время задержки (мс)
 */
async function sleep(msec:number){
    const t0 = Date.now()
    // console.log("sleep start",msec)
    await msleep(msec)
    // console.log("sleep end",(Date.now()-t0))
}

/** HTTP Сервер */
export const app: express.Application = express();

/** Конфигурация сервера */
export interface appConfig {
    server: {
        port: number,
        ip: string
    }
}

/** Сервер */
export let server : http.Server | undefined;

/** Клиент eureka */
let euClient : eu.Client | undefined

/** Старт сервера */
export function start(conf: appConfig & eu.ClientConfig ) {
    stop()
    server = app.listen( conf.server.port, conf.server.ip, ()=>{
        console.log( `started ${conf.server.ip}:${conf.server.port}` )
        //console.log( conf )
        if( conf.registry ){            
            conf.registry.ipAddr = conf.server.ip
            conf.registry.hostName = conf.registry.ipAddr
            conf.registry.port = conf.server.port
            conf.registry.homePageUrl = `http://${conf.server.ip}:${conf.server.port}/`
            conf.registry.healthCheckUrl = `http://${conf.server.ip}:${conf.server.port}/`
            conf.registry.statusPageUrl = `http://${conf.server.ip}:${conf.server.port}/`

            console.log( "try registry in eureka",conf.registry )

            euClient = new eu.Client( conf )
            euClient.start().then( ()=>{
                console.log(`succ registered in eureka`, euClient)
            }).catch( ()=>{
                console.log(`fail register in eureka`)
            })
        }
    })
    return server
}

/** Остановка сервера */
export function stop(){
    if( euClient ){
        if( euClient.started ){
            euClient.stop().then( ()=>{
                console.log( `succ unregistered in eureka` )
            }).catch( ()=>{
                console.log( `fail unregistered in eureka` )
            })
        }
        euClient = undefined
    }

    if( server ){
        console.log( "close server" )
        server.close()
        server = undefined
    }
}

/** Обработчики запросов */
app.get( '/',(req,res)=>res.send("hello") );
