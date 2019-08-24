import eureka = require('../../ts/serv/EurekaClient');
import aux, { AxiosRequestConfig } from 'axios';

const euClient : eureka.Client = new eureka.Client({
    eureka:{
        api:[
            'http://localhost:8701/eureka',
            'http://localhost:8702/eureka',
        ]
    }
})

//#region  testFetch1
async function testFetch1(){
    const sample1addr = await euClient.app("sample1")
    console.log( sample1addr )
    const apiUrls = sample1addr.application.instance.map( i => `http://${i.ipAddr}:${i.port.$}` )        
    console.log( apiUrls )
    if( apiUrls.length>0 ){

        for( let ti=0; ti<20; ti++ ){
            const a = ti
            const b = ti*2+1
            const urls = apiUrls.map( u => `${u}/sum/${a}/${b}` )        
            let urli = 0
            const tryMax = 10
            while( urli<tryMax ){
                urli++
                const url = urls[urli % urls.length]
                console.log( `${ti} try ${urli}: get sum of `,{a:a, b:b, url:url} )
                const t0 = Date.now()
                try {
                    const res = await aux.get( url )
                    const t1 = Date.now()
                    console.log( `${ti} try ${urli}: sample1 get `,
                        {data:res.data, time:t1-t0} 
                    )
                    break
                } catch( e ) {
                    const t1 = Date.now()
                    console.log( `${ti} try ${urli}: catch error `,
                        {error:e, time:t1-t0} 
                    )
                }
            }
        }
    }
}

//testFetch1()
//#endregion

/** Сервис который зарегистрирован в eureka */
class Service {
    instances:eureka.Instance[] = []

    private initAppProm : Promise<any>
    private initFinished = false
    private initSuccess = false
    
    /**
     * Конструктор
     * @param eu клиент eureka
     * @param name имя сервиса
     */
    constructor( eu:eureka.Client, name:string ){
        this.initAppProm =
        eu.app(name).then( appInfo => {
                this.instances = appInfo.application.instance
                console.log(
                    `sucess fetch app "${name}" urls:`,
                    this.serviceUrlPrefix().map( i => i.url )
                )
                this.initFinished = true
                this.initSuccess = true
            }).catch( err => {
                console.error("catch err: ",err)
                this.initFinished = true
                this.initSuccess = false
            })
    }

    serviceUrlPrefix(){
        return this.instances.map( i => {
            return { 
                instance: i, 
                url: `http://${i.ipAddr}:${i.port.$}`
            }
        })
    }

    protected roundRobinIndex = -1

    readonly log = {
        print:(message:any)=>{},
        request: {
            begin:(url:string,opts?:any)=>{
                const ent : {[name:string]:any} = {}
                ent.url = url
                if( opts )Object.keys(opts).forEach( k => { ent[k]=opts[k] })
                this.log.print(ent)
            },
            call:(url:string, attempt:number, tryMax:number,opts?:any)=>{ 
                const ent : {[name:string]:any} = {}
                ent.url = url
                ent.attempt = attempt
                ent.tryMax = tryMax
                if( opts )Object.keys(opts).forEach( k => { ent[k]=opts[k] })
                this.log.print(ent)
            },
            callFail:(url:string, attempt:number, tryMax:number,opts?:any)=>{
                const ent : {[name:string]:any} = {}
                ent.url = url
                ent.attempt = attempt
                ent.tryMax = tryMax
                if( opts )Object.keys(opts).forEach( k => { ent[k]=opts[k] })
                this.log.print(ent)
            },
            end:(url:string,err?:any,opts?:any)=>{
                const ent : {[name:string]:any} = {}
                ent.url = url
                if( opts )Object.keys(opts).forEach( k => { ent[k]=opts[k] })
                this.log.print(ent)
            }
        },
        checkInited: {
            waitInit: ()=>{ this.log.print({
                action: "checkInited"
            })},
            initFail: ()=>{ this.log.print({
                action: "init fail"
            })}
        }
    }

    protected async checkInited(){
        if( !this.initFinished ){
            this.log.checkInited.waitInit()
            await this.initAppProm
        }
        if( !this.initSuccess ){
            this.log.checkInited.initFail()
            throw new Error("service is not initialized")
        }
    }

    readonly stat:{[instId:string]:eureka.InstanceStat} = {}

    protected collect( instId:string, waitTime:number, succ:boolean) {
        let instSt = this.stat[instId]
        if( !instSt ){
            instSt = new eureka.InstanceStat()
            this.stat[instId] = instSt
        }
        instSt.collect( waitTime, succ )
    }

    async get(url:string, config?: AxiosRequestConfig) {
        await this.checkInited()

        this.log.request.begin(url)

        const absAddr = url.startsWith('http:') || url.startsWith('https:')
        const firstSlash = url.startsWith('/')

        if( absAddr ){
            console.log("abs call")
            try {
                this.log.request.call(url,1,1)
                const res = await aux.get(url,config)
                this.log.request.end(url)
                return res
            } catch ( err ) {
                //return undefined
                this.log.request.end(url,err)
                throw err
            }
        }else{
            this.roundRobinIndex++

            const srvcUrls = this.serviceUrlPrefix()
            if( srvcUrls.length<1 )throw new Error("service base url not defined")

            //const urls = srvcUrls.map( s => s.url+(firstSlash ? url : '/'+url) )
            let urli = 0
            const tryMax = 10

            const instId = (inst:eureka.Instance):string => {
                if( inst.instanceId ){
                    return inst.instanceId
                }
                return `${inst.ipAddr}:${inst.port.$}:${inst.app}`
            }
            
            const t0 = Date.now()
            let tsum = 0
            let tcnt = 0
            while( true ){
                const t1 = Date.now()
                const collectTime = (inst:eureka.Instance,succ:boolean)=>{
                    const t2 = Date.now()
                    const treq = t2 - t1
                    tcnt++
                    tsum += treq
                    this.collect(instId(inst), treq, succ)
                    return {
                        calls: tcnt,
                        times: {
                            summary: tsum,
                            avg: (tcnt>0 ? tsum / tcnt : 0)
                        }
                    }
                }
                urli++
                const inst = srvcUrls[
                    (urli + this.roundRobinIndex) % srvcUrls.length
                ]
                try {
                    const targetUrl = inst.url+(firstSlash ? url : '/'+url)
                    const attempt = urli
                    
                    this.log.request.call(targetUrl,attempt,tryMax)
                    const res = await aux.get( targetUrl, config )
                    this.log.request.end(targetUrl,undefined,collectTime(inst.instance, true))

                    return res
                } catch( err ){
                    const t2 = Date.now()
                    const treq = t2 - t1
                    tcnt++
                    tsum += treq

                    const x = collectTime(inst.instance, false)
                    if( urli>=tryMax ){
                        this.log.request.end(url,err,x)
                        throw err
                    }
                }
            }
        }
    }
}

async function testFetch2(){
    console.log("=========== testFetch2 =============")
    const srv = new Service(euClient,"sample1")
    srv.log.print = msg => console.log('[debug]',msg)
    for( let i=0; i<200; i++ ){
        let res = await srv.get(`/sum/${i}/${i+i*2}`)
        console.log(`sum ${i} + ${i+i*2} = `,res.data)
    }

    console.log("------- stat -------------")
    Object.keys( srv.stat ).forEach( instId => {
        console.log( "instance ",instId,srv.stat[instId].stat )
    })
}

testFetch2()
