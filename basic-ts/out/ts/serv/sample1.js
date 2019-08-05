"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const eureka = require("./EurekaClient");
const app = express();
app.get('/', (req, res) => {
    res.send("hello");
});
app.get('/info', (req, res) => {
    res.send("hello");
});
app.get('/sum/:a/:b', (req, res, next) => {
    let a = req.params.a;
    let b = req.params.b;
    if (a !== undefined && b !== undefined && parseFloat(a) !== NaN && parseFloat(b) !== NaN) {
        let c = parseFloat(a) + parseFloat(b);
        res.json({ sum: c });
        console.log(`request ${req.url} from ip:${req.ip}`);
        next();
    }
    else {
        let msg = `catch ${req.url}`;
        msg += `<br/>`;
        msg += "<pre>";
        msg += `${JSON.stringify(req.params, undefined, 2)}`;
        msg += "</pre>";
        res.send(msg);
    }
});
let euClient;
const httpServ = app.listen(3000, () => {
    console.log("http started");
    euClient = new eureka.Client({
        eureka: {
            api: [
                'http://localhost:8701/eureka',
                'http://localhost:8702/eureka',
            ]
        },
        registry: {
            app: 'sample1',
            hostName: 'localhost',
            port: 3000,
            homePageUrl: 'http://localhost:3000/info',
            ipAddr: '127.0.0.1',
            status: "UP"
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
//# sourceMappingURL=sample1.js.map