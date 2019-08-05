import express = require('express');
import { TsBasConf } from './TsBasConf'

/**
 * Сервер приложения TSBASIC
 */
export class TsBasServ {
    /** Конфигурация */
    readonly conf : TsBasConf

    /**
     * Конструктор
     * @param conf конфигурация сервера 
     */
    constructor(conf:TsBasConf){
        this.conf = conf
    }

    readonly app: express.Application = express()

    /**
     * Запуск сервера
     */
    run(){
        this.app.get('*.bas',(req,res,next)=>{
            res.send(
                '<pre>'+
                JSON.stringify(
                    {
                        "a":req.url,
                        "b":req.query,
                        "c":req.params
                    }
                    ,undefined,2
                )+
                '</pre>'
            )
        });

        if( this.conf.host ){
            this.app.listen(this.conf.port, this.conf.host, ()=>{
                console.log(
                    `tsbasic server started on ${this.conf.host}:${this.conf.port}`)
            })
        }else{
            this.app.listen(this.conf.port,()=>{
                console.log(
                    `tsbasic server started on port ${this.conf.port}`)
            })
        }
        return this
    }
}