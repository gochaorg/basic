"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
/**
 * Сервер приложения TSBASIC
 */
class TsBasServ {
    /**
     * Конструктор
     * @param conf конфигурация сервера
     */
    constructor(conf) {
        this.app = express();
        this.conf = conf;
    }
    /**
     * Запуск сервера
     */
    run() {
        this.app.get('*.bas', (req, res, next) => {
            res.send('<pre>' +
                JSON.stringify({
                    "a": req.url,
                    "b": req.query,
                    "c": req.params
                }, undefined, 2) +
                '</pre>');
        });
        if (this.conf.host) {
            this.app.listen(this.conf.port, this.conf.host, () => {
                console.log(`tsbasic server started on ${this.conf.host}:${this.conf.port}`);
            });
        }
        else {
            this.app.listen(this.conf.port, () => {
                console.log(`tsbasic server started on port ${this.conf.port}`);
            });
        }
        return this;
    }
}
exports.TsBasServ = TsBasServ;
//# sourceMappingURL=TsBasServ.js.map