"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const eureka = require("./EurekaClient");
const Num_1 = require("../common/Num");
const CmdLine_1 = require("../common/CmdLine");
//import ssleep = require('system-sleep');
// #region Конфигурация
// порт
let port = 3000;
// адреса eureka
let eurekaApi = ['http://localhost:8701/eureka', 'http://localhost:8702/eureka'];
// минимальная задержка
let sleepMin = 0;
// максимальная задержка
let sleepMax = 0;
// процент отказа
let failurePercentage = 0;
// интервал времени (сек) с которым проверять доступность сервиса
let heartbeatInSecs = 10;
//#endregion
/* #region обработка параметров к строки */
let eurekaCmdLineParam = 0;
CmdLine_1.cmdline.match({
    "-port": {
        num: (n) => { port = n; }
    },
    "-eureka": {
        str: (url) => {
            eurekaCmdLineParam++;
            if (eurekaCmdLineParam == 1)
                eurekaApi = [];
            eurekaApi.push(url);
        }
    },
    "-heartbeat.sec": {
        int: (sec) => heartbeatInSecs = sec
    },
    "-sleep.min": {
        int: (n) => sleepMin = n
    },
    "-sleep.max": {
        int: (n) => sleepMax = n
    },
    "-fail.pct": {
        num: (n) => failurePercentage = n
    }
});
/* #endregion */
function msleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    });
}
/**
 * Задержка на указанное кол-во мсекунд
 * @param msec время задержки
 */
function sleep(msec) {
    return __awaiter(this, void 0, void 0, function* () {
        const t0 = Date.now();
        // console.log("sleep start",msec)
        yield msleep(msec);
        // console.log("sleep end",(Date.now()-t0))
    });
}
//#region старт сервера
const app = express();
let euClient;
const httpServ = app.listen(port, () => {
    console.log("http started");
    euClient = new eureka.Client({
        eureka: {
            api: eurekaApi
        },
        registry: {
            app: 'sample1',
            hostName: 'localhost',
            port: port,
            homePageUrl: `http://localhost:${port}/info`,
            ipAddr: '127.0.0.1',
            status: "UP",
            leaseInfo: {
                renewalIntervalInSecs: heartbeatInSecs,
                durationInSecs: heartbeatInSecs * 3
                //evictionDurationInSecs: evictionDurationInSecs*2
            }
        }
    });
    euClient.start().then(() => {
        console.log("eureka client started");
    }).catch(() => {
        console.log("eureka client start fails");
        httpServ.close();
    });
});
app.post('/shutdown', (req, res) => {
    console.log("shutdown server");
    const euStop = (next) => {
        if (euClient) {
            euClient.stop().then(() => {
                next();
            }).catch(() => {
                next();
            });
        }
        else {
            next();
        }
    };
    euStop(() => {
        httpServ.close();
        process.exit(1);
    });
});
//#endregion
app.get('/', (req, res) => {
    res.send("hello");
});
const info = {
    request: {
        total: 0,
        fail: 0,
        imitationFail: 0,
        times: 0
    }
};
app.get('/info', (req, res) => { res.json(info); });
app.get('/sum/:a/:b', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const t0 = Date.now();
    info.request.total++;
    try {
        let a = req.params.a;
        let b = req.params.b;
        if (a !== undefined && b !== undefined && parseFloat(a) !== NaN && parseFloat(b) !== NaN) {
            console.log(`request ${req.url} from ip:${req.ip}`);
            if (sleepMin >= 0 && sleepMax > 0) {
                const sleepTime = Num_1.asInt(Math.random() * (Math.abs(sleepMin - sleepMax)) + Math.min(sleepMax, sleepMin));
                if (sleepTime > 0) {
                    // const t_s0 = Date.now()
                    // console.log('sleep',sleepTime)
                    yield sleep(sleepTime);
                    //const t_s1 = Date.now()
                    //console.log(`continue ${t_s1 - t_s0}`)
                }
            }
            if (failurePercentage > 0) {
                const failPct = (Math.random() * 100);
                const doFail = failurePercentage > failPct;
                if (doFail) {
                    console.log('imitation of failure');
                    res.status(400).send('imitation of failure');
                    info.request.fail++;
                    info.request.imitationFail++;
                    return;
                }
            }
            let c = parseFloat(a) + parseFloat(b);
            res.json({ sum: c });
            next();
        }
        else {
            info.request.fail++;
            console.error("/sum bad params", req.params);
            res.status(400).send(`/sum a=${a} b=${b}`);
        }
    }
    catch (e) {
        console.error("request /sum error", { error: e, req: req });
    }
    finally {
        const t1 = Date.now();
        info.request.times += t1 - t0;
    }
}));
//# sourceMappingURL=sample1.js.map