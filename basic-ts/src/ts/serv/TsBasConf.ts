import { TsBasServ } from "./TsBasServ";

/**
 * Конфигурация
 */
export class TsBasConf {
    /** Корневой каталог */
    root:string

    /** Порт на котором стартует сервер */
    port:number = 3000

    /** Хост на котором запускается сервер */
    host?:string

    constructor(){
        this.root = process.cwd()
    }

    run(){
        const serv = new TsBasServ(this)
        serv.run()
        return serv
    }
}
