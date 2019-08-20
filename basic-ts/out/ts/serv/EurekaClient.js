"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
/**
 * Клиент eureka серверов
 */
class Client {
    /** Конструктор */
    constructor(conf) {
        this.clientStarted = false;
        if (conf.eureka.api.length < 1) {
            throw new Error("conf.eureka.api.length<1");
        }
        this.conf = conf;
    }
    registryUrl(appId) {
        return this.conf.eureka.api.map(api => api + "/apps/" + appId);
    }
    /**
     * Возвращает идентификатор экземпляра
     */
    get instanceId() {
        if (this.conf.registry === undefined) {
            throw new Error("can't resolve instanceId, conf.registry undefined");
        }
        if (this.conf.registry.instanceId) {
            return this.conf.registry.instanceId;
        }
        return this.conf.registry.hostName +
            ":" + this.conf.registry.port +
            ":" + this.conf.registry.app;
    }
    get tryMax() { return 10; }
    /** Указывает зарегистрирован ли клиент как сервис в eureka */
    get started() { return this.started; }
    /**
     * Регистрация сервиса в eureka
     */
    start() {
        if (this.conf.registry === undefined) {
            throw new Error("can't registry client, conf.registry undefined");
        }
        const urls = this.registryUrl(this.conf.registry.app);
        if (urls.length < 1)
            throw new Error("registryUrl return 0 urls");
        const cfg = this.conf.registry;
        let data = {
            instanceId: this.instanceId,
            hostName: cfg.hostName,
            app: cfg.app,
            ipAddr: cfg.ipAddr,
            status: cfg.status,
            port: { "$": `${cfg.port}`, "@enabled": "true" },
            homePageUrl: cfg.homePageUrl
        };
        if (cfg.vipAddress)
            data.vipAddress = cfg.vipAddress;
        if (cfg.secureVipAddress)
            data.secureVipAddress = cfg.secureVipAddress;
        if (cfg.securePort)
            data.securePort = { "$": `${cfg.securePort}`, "@enabled": "true" };
        if (cfg.dataCenter) {
            data.dataCenterInfo = {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                name: cfg.dataCenter
            };
        }
        else {
            data.dataCenterInfo = {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                name: "MyOwn"
            };
        }
        data.healthCheckUrl = cfg.healthCheckUrl ? cfg.healthCheckUrl : cfg.homePageUrl;
        data.statusPageUrl = cfg.statusPageUrl ? cfg.statusPageUrl : cfg.homePageUrl;
        const payload = {
            "instance": data
        };
        let iurl = -1;
        let succRes = () => { };
        let failRes = () => { };
        const prom = new Promise((resolve, reject) => {
            succRes = resolve;
            failRes = reject;
        });
        const tryReg = () => {
            iurl++;
            const url = urls[(iurl % urls.length)];
            console.log(`try registry ${cfg.app}`);
            const promise = axios_1.default.post(url, payload, {
            // headers: {
            //     "Content-Type": "application/json"
            // }
            });
            promise.then(res => {
                console.log("success registry");
                this.onSuccRegistry();
                succRes(this);
            }).catch(err => {
                console.log("fail registry:", err);
                if (iurl < this.tryMax) {
                    tryReg();
                }
                else {
                    this.onFailRegistry();
                    failRes(this);
                }
            });
        };
        tryReg();
        return prom;
    }
    /** Вызывается при успешной регистрации сервиса */
    onSuccRegistry() {
        this.clientStarted = true;
        this.startHeartbeats();
    }
    /** Вызывается при ошибки регистрации сервиса */
    onFailRegistry() {
    }
    deRegistryUrl(appId, instId) {
        return this.conf.eureka.api.map(api => api + "/apps/" + appId + "/" + instId);
    }
    /** Остановка клиента, де регистрация сервиса из eureka */
    stop() {
        if (this.conf.registry === undefined) {
            throw new Error("can't deregistry client, conf.registry undefined");
        }
        const urls = this.deRegistryUrl(this.conf.registry.app, this.instanceId);
        if (urls.length < 1)
            throw new Error("deRegistryUrl return 0 urls");
        let iurl = -1;
        let succRes = () => { };
        let failRes = () => { };
        const prom = new Promise((resolve, reject) => {
            succRes = resolve;
            failRes = reject;
        });
        const run = () => {
            iurl++;
            const url = urls[(iurl % urls.length)];
            axios_1.default.delete(url).then(res => {
                this.onSuccUnRegistry();
                succRes(this);
            }).catch(res => {
                console.log("fail unregister");
                if (iurl < this.tryMax) {
                    run();
                }
                else {
                    this.onFailUnRegistry();
                    failRes(this);
                }
            });
        };
        run();
        return prom;
    }
    /** Вызывается при успешном снятии с учета в eureka */
    onSuccUnRegistry() {
        this.stopHeartbeats();
        console.log("success deRegistry");
    }
    /** Вызывается при ошибки снятия с учета в eureka */
    onFailUnRegistry() {
        console.log("fail deRegistry");
    }
    /** Возвращает интервал (мс) с которым посылается heartbeat запрос */
    get heartbeatInterval() {
        return 1000 * 10;
    }
    /** Стартует таймер для посылки heartbeat запроса */
    startHeartbeats() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
        }
        this.heartbeatTimer = setInterval(() => {
            this.sendHeartbeat();
        }, this.heartbeatInterval);
    }
    /** Останавливает таймер heartbeat */
    stopHeartbeats() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
        }
    }
    heartbeatUrl(appId, instId) {
        return this.conf.eureka.api.map(api => api + "/apps/" + appId + "/" + instId);
    }
    /** Посылает heartbeat запрос */
    sendHeartbeat() {
        if (this.conf.registry === undefined) {
            throw new Error("can't send heartbeat, conf.registry undefined");
        }
        const urls = this.heartbeatUrl(this.conf.registry.app, this.instanceId);
        if (urls.length < 1)
            throw new Error("heartbeatUrl return 0 urls");
        let iurl = -1;
        let succRes = () => { };
        let failRes = () => { };
        const prom = new Promise((resolve, reject) => {
            succRes = resolve;
            failRes = reject;
        });
        const run = () => {
            iurl++;
            const url = urls[(iurl % urls.length)];
            axios_1.default.put(url).then(res => {
                console.log("succ hearbeat");
                succRes(this);
            }).catch(res => {
                console.log("fail hearbeat");
                if (iurl < this.tryMax) {
                    run();
                }
                else {
                    failRes(this);
                }
            });
        };
        run();
        return prom;
    }
    apps() {
        const urls = this.conf.eureka.api.map(u => u + "/apps");
        if (urls.length < 1)
            throw new Error("conf.eureka.api.length < 1");
        let iurl = -1;
        let succRes = () => { };
        let failRes = () => { };
        const prom = new Promise((resolve, reject) => {
            succRes = resolve;
            failRes = reject;
        });
        const run = () => {
            iurl++;
            const url = urls[(iurl % urls.length)];
            axios_1.default.get(url).then(res => {
                succRes(res.data);
            }).catch(res => {
                console.log("fail apps query");
                if (iurl < this.tryMax) {
                    run();
                }
                else {
                    failRes(this);
                }
            });
        };
        run();
        return prom;
    }
    app(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const urls = this.conf.eureka.api.map(u => u + "/apps/" + name);
            if (urls.length < 1)
                throw new Error("conf.eureka.api.length < 1");
            let iurl = -1;
            let succRes = () => { };
            let failRes = () => { };
            const prom = new Promise((resolve, reject) => {
                succRes = resolve;
                failRes = reject;
            });
            const run = () => {
                iurl++;
                const url = urls[(iurl % urls.length)];
                axios_1.default.get(url).then(res => {
                    //console.log(res.data)
                    succRes(res.data);
                }).catch(res => {
                    console.log("fail app query");
                    if (iurl < this.tryMax) {
                        run();
                    }
                    else {
                        failRes(this);
                    }
                });
            };
            run();
            return prom;
        });
    }
}
exports.Client = Client;
exports.default = Client;
//# sourceMappingURL=EurekaClient.js.map