/**
 * Конфигурация
 */
export class Conf {
    /** Корневой каталог */
    root:string

    /** Порт на котором стартует сервер */
    port:number = 3000

    constructor(){
        this.root = process.cwd()
    }
}
