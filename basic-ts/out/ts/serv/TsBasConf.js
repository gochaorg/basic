"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TsBasServ_1 = require("./TsBasServ");
/**
 * Конфигурация
 */
class TsBasConf {
    constructor() {
        /** Порт на котором стартует сервер */
        this.port = 3000;
        this.root = process.cwd();
    }
    run() {
        const serv = new TsBasServ_1.TsBasServ(this);
        serv.run();
        return serv;
    }
}
exports.TsBasConf = TsBasConf;
//# sourceMappingURL=TsBasConf.js.map