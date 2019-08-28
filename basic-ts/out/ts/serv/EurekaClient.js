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
        /** Возвращает интервал (мс) с которым посылается heartbeat запрос */
        this.prefferedHeartbeatInterval = undefined;
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
        if (cfg.leaseInfo) {
            data.leaseInfo = {};
            if (cfg.leaseInfo.durationInSecs) {
                data.leaseInfo.durationInSecs = cfg.leaseInfo.durationInSecs;
                this.prefferedHeartbeatInterval = cfg.leaseInfo.durationInSecs * 1000;
            }
            if (cfg.leaseInfo.renewalIntervalInSecs) {
                data.leaseInfo.renewalIntervalInSecs = cfg.leaseInfo.renewalIntervalInSecs;
            }
        }
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
            console.log(`try registry ${cfg.app}`, data);
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
    get heartbeatInterval() {
        if (this.prefferedHeartbeatInterval)
            return this.prefferedHeartbeatInterval;
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
    /** Получение информации о сервисах */
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
    /** Получение информации о конкретном сервисе */
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
/** Учет статистики взова */
class InstanceStat {
    constructor() {
        this.maxEntries = 100;
        this.calls = [];
    }
    /**
     * фиксирование информации о вызове сервиса
     * @param wait - ожидание в мс
     * @param succ - успешность вызова
     */
    collect(wait, succ) {
        if (this.maxEntries > 0) {
            this.calls.push({ wait: wait, time: Date.now(), succ: succ });
            while (this.calls.length > this.maxEntries) {
                this.calls.shift();
            }
        }
    }
    /** получение оперативной статистики о работе экземпляра сервиса */
    get stat() {
        const waits = this.calls.map(i => i.wait).reduce((a, b) => a + b);
        const total = this.calls.length;
        const success = this.calls.filter(i => i.succ).length;
        const fails = this.calls.filter(i => i.succ == false).length;
        const avg = total > 0 ? waits / total : 0;
        return {
            accessibility: {
                total: total,
                success: success,
                fails: fails,
                pct: total > 0 ? 100 * success / total : -1
            },
            times: {
                waits: waits,
                avg: avg
            }
        };
    }
}
exports.InstanceStat = InstanceStat;
/** Сервис который зарегистрирован в eureka */
class Service {
    /**
     * Конструктор
     * @param eu клиент eureka
     * @param name имя сервиса
     */
    constructor(eu, name) {
        /** список экземпляров */
        this.instances = [];
        /** время когда был получен список экземпляров  */
        this.instFetchDate = undefined;
        /** таймаут (мс) после которого необходимо запросить новый список сервисов */
        this.renewInstTimeout = undefined;
        /** инициализация завершена */
        this.initFinished = false;
        /** инициализация завершена успешно */
        this.initSuccess = false;
        this.reinitStartDate = undefined;
        this.roundRobinIndex = -1;
        /** логирование */
        this.log = {
            print: (message) => { },
            request: {
                begin: (url, opts) => {
                    const ent = {};
                    ent.url = url;
                    ent.state = "begin";
                    if (opts)
                        Object.keys(opts).forEach(k => { ent[k] = opts[k]; });
                    this.log.print(ent);
                },
                call: (url, attempt, tryMax, opts) => {
                    const ent = {};
                    ent.url = url;
                    ent.attempt = attempt;
                    ent.tryMax = tryMax;
                    if (opts)
                        Object.keys(opts).forEach(k => { ent[k] = opts[k]; });
                    this.log.print(ent);
                },
                callFail: (url, attempt, tryMax, opts) => {
                    const ent = {};
                    ent.url = url;
                    ent.attempt = attempt;
                    ent.tryMax = tryMax;
                    if (opts)
                        Object.keys(opts).forEach(k => { ent[k] = opts[k]; });
                    this.log.print(ent);
                },
                end: (url, err, opts) => {
                    const ent = {};
                    ent.url = url;
                    ent.state = "end";
                    if (opts)
                        Object.keys(opts).forEach(k => { ent[k] = opts[k]; });
                    this.log.print(ent);
                }
            },
            checkInited: {
                waitInit: () => {
                    this.log.print({
                        action: "checkInited"
                    });
                },
                initFail: () => {
                    this.log.print({
                        action: "init fail"
                    });
                }
            },
            reinit: {
                error: (err) => this.log.print({ method: "reinit", state: "error", error: err }),
                success: () => this.log.print({ method: "reinit", state: "success" }),
                started: () => this.log.print({ method: "reinit", state: "started" })
            }
        };
        /** статистика по экземплярам */
        this.stat = {};
        this.eu = eu;
        this.initAppProm =
            eu.app(name).then(appInfo => {
                this.instances = appInfo.application.instance;
                // console.log(
                //     `sucess fetch app "${name}" urls:`,
                //     this.serviceUrlPrefix().map( i => i.url )
                // )
                this.initFinished = true;
                this.initSuccess = true;
                this.instFetchDate = Date.now();
                this.renewInstTimeout = this.instances.
                    map(inst => inst.leaseInfo.renewalIntervalInSecs).
                    map(sec => sec * 1000).
                    reduce((a, b) => a < b ? a : b);
            }).catch(err => {
                console.error("catch err: ", err);
                this.initFinished = true;
                this.initSuccess = false;
            });
    }
    serviceUrlPrefix() {
        return this.instances.map(i => {
            return {
                instance: i,
                url: `http://${i.ipAddr}:${i.port.$}`
            };
        });
    }
    /** Повторная инициализация */
    reinit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.reinit.started();
            this.reinitStartDate = Date.now();
            this.eu.app(name).then(appInfo => {
                this.instances = appInfo.application.instance;
                this.initFinished = true;
                this.initSuccess = true;
                this.instFetchDate = Date.now();
                this.renewInstTimeout = this.instances.
                    map(inst => inst.leaseInfo.renewalIntervalInSecs).
                    map(sec => sec * 1000).
                    reduce((a, b) => a < b ? a : b);
                this.log.reinit.success();
            }).catch(err => {
                this.log.reinit.error(err);
                //this.initFinished = true
                //this.initSuccess = false
            });
        });
    }
    /** проверка завершения инициализации */
    checkInited() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initFinished) {
                this.log.checkInited.waitInit();
                yield this.initAppProm;
            }
            if (!this.initSuccess) {
                this.log.checkInited.initFail();
                throw new Error("service is not initialized");
            }
        });
    }
    /** учет статистики вызова экземпляра */
    collect(instId, waitTime, succ) {
        let instSt = this.stat[instId];
        if (!instSt) {
            instSt = new InstanceStat();
            this.stat[instId] = instSt;
        }
        instSt.collect(waitTime, succ);
    }
    /** выполнение get запроса к сервису
     * @param url - адрес,
     * если указан адрес относительно корня, без http и домена/ip (например /method/arg1/arg2?blabla),
     * тогда будет задествован механизм обработки отказов faultTolerance
     * @param config - конфигурация axios
     * @returns результат вызова
     */
    get(url, config) {
        return __awaiter(this, void 0, void 0, function* () {
            // ожидание инициализации
            yield this.checkInited();
            // проверка необходимости повторной инициализации списка сервисов
            if (this.renewInstTimeout && this.renewInstTimeout > 0) {
                // определенно время последней инициализации
                if (this.instFetchDate) {
                    // подсчет сколько прошло времени
                    const tdiff = Date.now() - this.instFetchDate;
                    // проверка - вышел ли таймацт и требуется повторная инициализация
                    if (tdiff >= this.renewInstTimeout) {
                        // проверяем сколько прошло времени с последнего вызова повторной инициализации
                        const tdiff2 = this.reinitStartDate ? Date.now() - this.reinitStartDate : this.renewInstTimeout * 2;
                        if (tdiff2 >= this.renewInstTimeout) {
                            // с повторной инициализации прошло достаточно времени, вызываем повторную инициализацю
                            this.reinit();
                        }
                    }
                }
            }
            this.log.request.begin(url, { method: "get" });
            const absAddr = url.startsWith('http:') || url.startsWith('https:');
            const firstSlash = url.startsWith('/');
            if (absAddr) {
                // вызов конкретного экземпляра
                try {
                    this.log.request.call(url, 1, 1);
                    const res = yield axios_1.default.get(url, config);
                    this.log.request.end(url);
                    return res;
                }
                catch (err) {
                    this.log.request.end(url, err);
                    throw err;
                }
            }
            else {
                // берем очередной экземпляр по кругу 
                this.roundRobinIndex++;
                const srvcUrls = this.serviceUrlPrefix();
                if (srvcUrls.length < 1)
                    throw new Error("service base url not defined");
                // номер попытки            
                let urli = 0;
                // максимальное кол-во поыток
                const tryMax = 10;
                // сопоставление экземпляра и его идентификатора
                const instId = (inst) => {
                    if (inst.instanceId) {
                        return inst.instanceId;
                    }
                    return `${inst.ipAddr}:${inst.port.$}:${inst.app}`;
                };
                // засекаем время и кол-во попыток
                const t0 = Date.now();
                let tsum = 0;
                let tcnt = 0;
                while (true) {
                    // засекаем время (начало) вызова
                    const t1 = Date.now();
                    const collectTime = (inst, succ) => {
                        // засекаем время (конец) вызова
                        const t2 = Date.now();
                        const treq = t2 - t1;
                        tcnt++;
                        tsum += treq;
                        // фиксируем время и успешность вызова
                        this.collect(instId(inst), treq, succ);
                        return {
                            calls: tcnt,
                            times: {
                                summary: tsum,
                                avg: (tcnt > 0 ? tsum / tcnt : 0)
                            }
                        };
                    };
                    // берем очередной экземпляр и делаем попытку вызова
                    urli++;
                    const inst = srvcUrls[(urli + this.roundRobinIndex) % srvcUrls.length];
                    // получаем целевой адрес
                    const targetUrl = inst.url + (firstSlash ? url : '/' + url);
                    const attempt = urli;
                    try {
                        // делаем вызов
                        this.log.request.call(targetUrl, attempt, tryMax);
                        const res = yield axios_1.default.get(targetUrl, config);
                        this.log.request.end(targetUrl, undefined, collectTime(inst.instance, true));
                        // возвращаем результат
                        return res;
                    }
                    catch (err) {
                        // ведем учет общего времени на данный метод get
                        const t2 = Date.now();
                        const treq = t2 - t1;
                        tcnt++;
                        tsum += treq;
                        // фиксируем ошибку вызова в статистике на данный экземпляр
                        const x = collectTime(inst.instance, false);
                        if (urli >= tryMax) {
                            // кол-во вызовов превысело максимальное допустимое
                            this.log.request.end(url, err, x);
                            throw err;
                        }
                        else {
                            this.log.request.callFail(targetUrl, attempt, tryMax);
                        }
                    }
                }
            }
        });
    }
}
//export default Client, InstanceStat;
//# sourceMappingURL=EurekaClient.js.map