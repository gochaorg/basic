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
const eureka = require("../../ts/serv/EurekaClient");
const axios_1 = __importDefault(require("axios"));
const euClient = new eureka.Client({
    eureka: {
        api: [
            'http://localhost:8701/eureka',
            'http://localhost:8702/eureka',
        ]
    }
});
//#region  testFetch1
function testFetch1() {
    return __awaiter(this, void 0, void 0, function* () {
        const sample1addr = yield euClient.app("sample1");
        console.log(sample1addr);
        const apiUrls = sample1addr.application.instance.map(i => `http://${i.ipAddr}:${i.port.$}`);
        console.log(apiUrls);
        if (apiUrls.length > 0) {
            for (let ti = 0; ti < 20; ti++) {
                const a = ti;
                const b = ti * 2 + 1;
                const urls = apiUrls.map(u => `${u}/sum/${a}/${b}`);
                let urli = 0;
                const tryMax = 10;
                while (urli < tryMax) {
                    urli++;
                    const url = urls[urli % urls.length];
                    console.log(`${ti} try ${urli}: get sum of `, { a: a, b: b, url: url });
                    const t0 = Date.now();
                    try {
                        const res = yield axios_1.default.get(url);
                        const t1 = Date.now();
                        console.log(`${ti} try ${urli}: sample1 get `, { data: res.data, time: t1 - t0 });
                        break;
                    }
                    catch (e) {
                        const t1 = Date.now();
                        console.log(`${ti} try ${urli}: catch error `, { error: e, time: t1 - t0 });
                    }
                }
            }
        }
    });
}
//testFetch1()
//#endregion
class InstanceStat {
    constructor() {
        this.maxEntries = 100;
        this.calls = [];
    }
    collect(wait, succ) {
        if (this.maxEntries > 0) {
            this.calls.push({ wait: wait, time: Date.now(), succ: succ });
            while (this.calls.length > this.maxEntries) {
                this.calls.shift();
            }
        }
    }
    get stat() {
        const waits = this.calls.map(i => i.wait).reduce((a, b) => a + b);
        const total = this.calls.length;
        const success = this.calls.filter(i => i.succ).length;
        const fails = this.calls.filter(i => i.succ == false).length;
        const avg = total > 0 ? waits / total : 0;
        return {
            total: total,
            success: success,
            fails: fails,
            times: {
                waits: waits,
                avg: avg
            }
        };
    }
}
class Service {
    constructor(eu, name) {
        this.instances = [];
        this.initFinished = false;
        this.initSuccess = false;
        this.roundRobinIndex = -1;
        this.log = {
            print: (message) => { },
            request: {
                begin: (url, opts) => {
                    const ent = {};
                    ent.url = url;
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
            }
        };
        this.stat = {};
        this.initAppProm =
            eu.app(name).then(appInfo => {
                this.instances = appInfo.application.instance;
                console.log(`sucess fetch app "${name}" urls:`, this.serviceUrlPrefix().map(i => i.url));
                this.initFinished = true;
                this.initSuccess = true;
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
    collect(instId, waitTime, succ) {
        let instSt = this.stat[instId];
        if (!instSt) {
            instSt = new InstanceStat();
            this.stat[instId] = instSt;
        }
        instSt.collect(waitTime, succ);
    }
    get(url, config) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkInited();
            this.log.request.begin(url);
            const absAddr = url.startsWith('http:') || url.startsWith('https:');
            const firstSlash = url.startsWith('/');
            if (absAddr) {
                console.log("abs call");
                try {
                    this.log.request.call(url, 1, 1);
                    const res = yield axios_1.default.get(url, config);
                    this.log.request.end(url);
                    return res;
                }
                catch (err) {
                    //return undefined
                    this.log.request.end(url, err);
                    throw err;
                }
            }
            else {
                this.roundRobinIndex++;
                const srvcUrls = this.serviceUrlPrefix();
                if (srvcUrls.length < 1)
                    throw new Error("service base url not defined");
                //const urls = srvcUrls.map( s => s.url+(firstSlash ? url : '/'+url) )
                let urli = 0;
                const tryMax = 10;
                const instId = (inst) => {
                    if (inst.instanceId) {
                        return inst.instanceId;
                    }
                    return `${inst.ipAddr}:${inst.port.$}:${inst.app}`;
                };
                const t0 = Date.now();
                let tsum = 0;
                let tcnt = 0;
                while (true) {
                    const t1 = Date.now();
                    const collectTime = (inst, succ) => {
                        const t2 = Date.now();
                        const treq = t2 - t1;
                        tcnt++;
                        tsum += treq;
                        this.collect(instId(inst), treq, succ);
                        return {
                            calls: tcnt,
                            times: {
                                summary: tsum,
                                avg: (tcnt > 0 ? tsum / tcnt : 0)
                            }
                        };
                    };
                    urli++;
                    const inst = srvcUrls[(urli + this.roundRobinIndex) % srvcUrls.length];
                    try {
                        const targetUrl = inst.url + (firstSlash ? url : '/' + url);
                        const attempt = urli;
                        this.log.request.call(targetUrl, attempt, tryMax);
                        const res = yield axios_1.default.get(targetUrl, config);
                        this.log.request.end(targetUrl, undefined, collectTime(inst.instance, true));
                        return res;
                    }
                    catch (err) {
                        const t2 = Date.now();
                        const treq = t2 - t1;
                        tcnt++;
                        tsum += treq;
                        const x = collectTime(inst.instance, false);
                        if (urli >= tryMax) {
                            this.log.request.end(url, err, x);
                            throw err;
                        }
                    }
                }
            }
        });
    }
}
function testFetch2() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("=========== testFetch2 =============");
        const srv = new Service(euClient, "sample1");
        srv.log.print = msg => console.log('[debug]', msg);
        for (let i = 0; i < 30; i++) {
            let res = yield srv.get(`/sum/${i}/${i + i * 2}`);
            console.log(`sum ${i} + ${i + i * 2} = `, res.data);
        }
        console.log("------- stat -------------");
        Object.keys(srv.stat).forEach(instId => {
            console.log("instance ", instId, srv.stat[instId].stat);
        });
    });
}
testFetch2();
//# sourceMappingURL=serviceFaulTolTest.js.map