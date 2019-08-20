import express = require('express');
import eureka = require('./EurekaClient');
import { asInt } from '../common/Num';
//import ssleep = require('system-sleep');

// #region Конфигурация

// порт
let port = 3000

// адреса eureka
let eurekaApi:string[] = ['http://localhost:8701/eureka','http://localhost:8702/eureka']

// минимальная задержка
let sleepMin = 0

// максимальная задержка
let sleepMax = 0

// процент отказа
let failurePercentage = 0
//#endregion

/* #region обработка параметров к строки */
const cmdline = {
    args: [...process.argv],
    shift: ()=>{ return cmdline.args.shift() },
    match: ( 
        ptrn:{
            [key:string]:{
                int?:(n:number)=>any,
                num?:(n:number)=>any,
                str?:(s:string)=>any
            }
        },
        cycle:boolean = true
    )=>{
        const parse = ()=>{
            const arg = cmdline.shift()
            if( arg ){
                const mptr = ptrn[arg]
                if( mptr ){
                    if( mptr.int ){
                        const arg2 = cmdline.shift()
                        if( arg2 ){
                            const n = parseInt(arg2, 10)
                            if( n!==NaN ){
                                mptr.int(n)
                            }
                        }
                    }
                    if( mptr.num ){
                        const arg2 = cmdline.shift()
                        if( arg2 ){
                            const n = parseFloat(arg2)
                            if( n!==NaN ){
                                mptr.num(n)
                            }
                        }
                    }
                    if( mptr.str ){
                        const arg2 = cmdline.shift()
                        if( arg2 ){
                            mptr.str(arg2)
                        }
                    }
                }
            }
        }

        if( cycle ){
            while( cmdline.args.length>0 ){
                parse()
            }
        }else{
            parse()
        }
    }
}

let eurekaCmdLineParam = 0
cmdline.match({
    "-port": {
        num:(n)=>{port = n}
    },
    "-eureka": {
        str:(url)=>{
            eurekaCmdLineParam++
            if( eurekaCmdLineParam==1 )eurekaApi = []
            eurekaApi.push(url)
        }
    },
    "-sleep.min": {
        int:(n)=>{ sleepMin = n }
    },
    "-sleep.max": {
        int:(n)=>{ sleepMax = n }
    },
    "-fail.pct": {
        num:(n)=>{ failurePercentage = n }
    }
})
/* #endregion */

async function msleep(ms:number) {
    return new Promise<any>( (resolve,reject)=>{
        setTimeout(resolve,ms)
    })
}

/**
 * Задержка на указанное кол-во мсекунд
 * @param msec время задержки
 */
async function sleep(msec:number){
    const t0 = Date.now()
    // console.log("sleep start",msec)
    await msleep(msec)
    // console.log("sleep end",(Date.now()-t0))
}

//#region старт сервера
const app: express.Application = express()

let euClient : eureka.Client

const httpServ = app.listen(port,()=>{
    console.log("http started")
    euClient = new eureka.Client({
        eureka:{
            api:eurekaApi
        },
        registry:{
            app:'sample1',
            hostName:'localhost',
            port:port,
            homePageUrl:`http://localhost:${port}/info`,
            ipAddr:'127.0.0.1',
            status:"UP"
        }
    })
    euClient.start().then(()=>{
        console.log("eureka client started")
    }).catch(()=>{
        console.log("eureka client start fails")
        httpServ.close()
    })
});

app.post('/shutdown',(req,res)=>{
    console.log("shutdown server")
    
    const euStop = (next:()=>any)=>{
        if( euClient ){
            euClient.stop().then( ()=>{
                next()
            }).catch(()=>{
                next()                
            })
        }else{
            next()
        }
    }

    euStop( ()=>{
        httpServ.close()
        process.exit(1)
    })
})
//#endregion

app.get('/',(req,res)=>{
    res.send("hello")
});

const info = {
    request: {
        total: 0,
        fail: 0,
        imitationFail: 0,
        times: 0
    }
}

app.get('/info',(req,res)=>{ res.json(info) });

app.get('/sum/:a/:b',async (req,res,next)=>{
    const t0 = Date.now()
    info.request.total++
    try {
        let a = req.params.a;
        let b = req.params.b;
        if( a!==undefined && b!==undefined && parseFloat(a)!==NaN && parseFloat(b)!==NaN ){
            console.log(`request ${req.url} from ip:${req.ip}`)
            if( sleepMin>=0 && sleepMax>0 ){
                const sleepTime = 
                    asInt(
                        Math.random() * (Math.abs(sleepMin - sleepMax)) + Math.min(sleepMax,sleepMin)
                    )
                if( sleepTime>0 ){
                    // const t_s0 = Date.now()
                    // console.log('sleep',sleepTime)
                    await sleep(sleepTime)
                    //const t_s1 = Date.now()
                    //console.log(`continue ${t_s1 - t_s0}`)
                }
            }
            if( failurePercentage>0 ){
                const failPct = (Math.random() * 100)                
                const doFail = failurePercentage > failPct
                if( doFail ){
                    console.log('imitation of failure')
                    res.status(400).send('imitation of failure')
                    info.request.fail++
                    info.request.imitationFail++
                    return
                }
            }
            let c = parseFloat(a) + parseFloat(b)
            res.json( {sum:c} )
            next()
        }else{
            info.request.fail++
            console.error("/sum bad params",req.params)
            res.status(400).send(`/sum a=${a} b=${b}`)
        }
    } catch( e ){
        console.error("request /sum error",{error:e, req: req})
    } finally {
        const t1 = Date.now()
        info.request.times += t1 - t0
    }
});

