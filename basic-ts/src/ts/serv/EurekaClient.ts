import aux from 'axios';
import { url } from 'inspector';

export type ClientStatus = "UP" | "DOWN" | "STARTING" | "OUT_OF_SERVICE" | "UNKNOWN"
export type DataCenter = "MyOwn" | "Amazon"

/**
 * Регистрация сервиса-клиента
 */
export interface Registry {
    instanceId?: string
    hostName: string //"localhost",
    app: string //"sample1",
    vipAddress?: string //"localhost",
    secureVipAddress?: string // "localhost",
    ipAddr: string //"127.0.0.1",
    status: ClientStatus,
    //"port": {"$": "3000", "@enabled": "true"},
    port:number
    //"securePort": {"$": "3001", "@enabled": "true"},
    securePort?:number
    healthCheckUrl?: string // "http://127.0.0.1:3000/info",
    statusPageUrl?: string //"http://127.0.0.1:3000/info",
    homePageUrl: string // "http://127.0.0.1:3000",
    // "dataCenterInfo": {
    //     "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo", 
    //     "name": "MyOwn"
    // }
    dataCenter?: DataCenter
}

/**
 * Настройки eureka серверов
 */
export interface EurekaConfig {
    api:string[]
}

/**
 * Конфигурация клиентов
 */
export interface ClientConfig {
    registry? : Registry
    eureka: EurekaConfig
}

export interface NetPort {
    "$": number
    "@enabled": boolean
}

export interface Instance {
    instanceId?:string
    hostName:string
    app:string
    ipAddr:string
    status:ClientStatus
    overriddenStatus?:ClientStatus
    port: NetPort
    securePort?: NetPort
    countryId?: number
    dataCenterInfo?: {
        "@class": string
        name: string
    }
    leaseInfo: {
        renewalIntervalInSecs: number
        durationInSecs: number
        registrationTimestamp: number
        lastRenewalTimestamp: number
        evictionTimestamp: number
        serviceUpTimestamp: number
    }
    homePageUrl?: string
    statusPageUrl?: string
    healthCheckUrl?: string
    isCoordinatingDiscoveryServer?: boolean
    lastUpdatedTimestamp: number
    lastDirtyTimestamp: number
    actionType: string
}

export interface App {
    name: string,
    instance: Instance[]
}

export interface AppQuery {
    application: App
}

export interface Apps {
    applications: {
        versions__delta?: string,
        apps__hashcode?: string,
        application: App[]
    }
}

/**
 * Клиент eureka серверов
 */
export class Client {
    /** Конфигурация клиента */
    readonly conf: ClientConfig

    /** Конструктор */
    constructor(conf: ClientConfig){
        if( conf.eureka.api.length<1 ){
            throw new Error("conf.eureka.api.length<1")
        }
        this.conf = conf
    }

    protected registryUrl(appId:string):string[] {
        return this.conf.eureka.api.map( api=>api+"/apps/"+appId )
    }

    /**
     * Возвращает идентификатор экземпляра
     */
    get instanceId():string {
        if( this.conf.registry===undefined ){
            throw new Error("can't resolve instanceId, conf.registry undefined")
        }

        if( this.conf.registry.instanceId ){
            return this.conf.registry.instanceId
        }
        return this.conf.registry.hostName+
            ":"+this.conf.registry.port+
            ":"+this.conf.registry.app
    }

    private get tryMax():number { return 10; }

    private clientStarted:boolean = false

    /** Указывает зарегистрирован ли клиент как сервис в eureka */
    get started():boolean { return this.started }

    /**
     * Регистрация сервиса в eureka 
     */
    start() {
        if( this.conf.registry===undefined ){
            throw new Error("can't registry client, conf.registry undefined")
        }

        const urls = this.registryUrl(this.conf.registry.app)
        if( urls.length<1 )throw new Error("registryUrl return 0 urls")

        const cfg = this.conf.registry

        let data : {[name:string]:any} = {
            instanceId: this.instanceId,
            hostName: cfg.hostName,
            app: cfg.app,
            ipAddr: cfg.ipAddr,
            status: cfg.status,
            port: {"$": `${cfg.port}`, "@enabled": "true"},
            homePageUrl: cfg.homePageUrl
        }

        if( cfg.vipAddress ) data.vipAddress = cfg.vipAddress
        if( cfg.secureVipAddress ) data.secureVipAddress = cfg.secureVipAddress
        if( cfg.securePort ) data.securePort = {"$": `${cfg.securePort}`, "@enabled": "true"}
        if( cfg.dataCenter ) {
            data.dataCenterInfo = {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                name: cfg.dataCenter
            }
        }else{
            data.dataCenterInfo = {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                name: "MyOwn"
            }
        }
        data.healthCheckUrl = cfg.healthCheckUrl ? cfg.healthCheckUrl : cfg.homePageUrl
        data.statusPageUrl = cfg.statusPageUrl ? cfg.statusPageUrl : cfg.homePageUrl

        const payload = {
            "instance" : data
        }

        let iurl = -1
        let succRes : (c:Client)=>any = ()=>{}
        let failRes : (c:Client)=>any = ()=>{}

        const prom = new Promise<Client>((resolve, reject) => { 
            succRes = resolve
            failRes = reject
        });
        
        const tryReg = () => {
            iurl++
            const url = urls[(iurl % urls.length)]

            console.log(`try registry ${cfg.app}`)
            const promise = aux.post( url, payload, {
                // headers: {
                //     "Content-Type": "application/json"
                // }
            } )
            promise.then(res=>{
                console.log("success registry")
                this.onSuccRegistry()
                succRes(this)
            }).catch(err=>{
                console.log("fail registry:",err)
                if( iurl < this.tryMax ){
                    tryReg()
                }else{
                    this.onFailRegistry()
                    failRes(this)
                }
            })
        }
        tryReg()

        return prom;
    }    

    /** Вызывается при успешной регистрации сервиса */
    protected onSuccRegistry() {
        this.clientStarted = true
        this.startHeartbeats()
    }

    /** Вызывается при ошибки регистрации сервиса */
    protected onFailRegistry() {
    }

    protected deRegistryUrl(appId:string, instId:string):string[] {
        return this.conf.eureka.api.map( api=>api+"/apps/"+appId+"/"+instId )
    }

    /** Остановка клиента, де регистрация сервиса из eureka */
    stop() {
        if( this.conf.registry===undefined ){
            throw new Error("can't deregistry client, conf.registry undefined")
        }

        const urls = this.deRegistryUrl(this.conf.registry.app, this.instanceId)
        if( urls.length<1 )throw new Error("deRegistryUrl return 0 urls")

        let iurl = -1
        let succRes : (c:Client)=>any = ()=>{}
        let failRes : (c:Client)=>any = ()=>{}
        const prom = new Promise<Client>((resolve, reject) => { 
            succRes = resolve
            failRes = reject
        });

        const run = ()=>{
            iurl++
            const url =  urls[(iurl % urls.length)]
            aux.delete(url).then(res=>{
                this.onSuccUnRegistry()
                succRes(this)
            }).catch(res=>{
                console.log("fail unregister")
                if( iurl < this.tryMax ){
                    run()
                }else{
                    this.onFailUnRegistry()
                    failRes(this)
                }
            })
        }

        run()

        return prom;
    }

    /** Вызывается при успешном снятии с учета в eureka */
    protected onSuccUnRegistry() {
        this.stopHeartbeats()
        console.log("success deRegistry")
    }

    /** Вызывается при ошибки снятия с учета в eureka */
    protected onFailUnRegistry() {
        console.log("fail deRegistry")
    }

    protected heartbeatTimer? : NodeJS.Timeout

    /** Возвращает интервал (мс) с которым посылается heartbeat запрос */
    get heartbeatInterval():number {
        return 1000*10
    }

    /** Стартует таймер для посылки heartbeat запроса */
    protected startHeartbeats() {
        if( this.heartbeatTimer ){
            clearInterval(this.heartbeatTimer)
            this.heartbeatTimer = undefined
        }

        this.heartbeatTimer = setInterval(()=>{
            this.sendHeartbeat()
        },this.heartbeatInterval)
    }

    /** Останавливает таймер heartbeat */
    protected stopHeartbeats() {
        if( this.heartbeatTimer ){
            clearInterval(this.heartbeatTimer)
            this.heartbeatTimer = undefined
        }
    }

    protected heartbeatUrl(appId:string, instId:string):string[] {
        return this.conf.eureka.api.map( api=>api+"/apps/"+appId+"/"+instId )
    }

    /** Посылает heartbeat запрос */
    sendHeartbeat(){
        if( this.conf.registry===undefined ){
            throw new Error("can't send heartbeat, conf.registry undefined")
        }

        const urls = this.heartbeatUrl(this.conf.registry.app, this.instanceId)
        if( urls.length<1 )throw new Error("heartbeatUrl return 0 urls")

        let iurl = -1
        let succRes : (c:Client)=>any = ()=>{}
        let failRes : (c:Client)=>any = ()=>{}
        const prom = new Promise<Client>((resolve, reject) => { 
            succRes = resolve
            failRes = reject
        });

        const run = ()=>{
            iurl++
            const url =  urls[(iurl % urls.length)]
            aux.put(url).then(res=>{
                console.log("succ hearbeat")
                succRes(this)
            }).catch(res=>{
                console.log("fail hearbeat")
                if( iurl < this.tryMax ){
                    run()
                }else{
                    failRes(this)
                }
            })
        }

        run()

        return prom;
    }

    apps(){
        const urls = this.conf.eureka.api.map( u => u+"/apps" )
        if( urls.length<1 )throw new Error("conf.eureka.api.length < 1")

        let iurl = -1
        let succRes : (c:Apps)=>any = ()=>{}
        let failRes : (c:any)=>any = ()=>{}
        const prom = new Promise<Apps>((resolve, reject) => { 
            succRes = resolve
            failRes = reject
        });

        const run = ()=>{
            iurl++
            const url =  urls[(iurl % urls.length)]
            aux.get(url).then(res=>{
                succRes(res.data)
            }).catch(res=>{
                console.log("fail apps query")
                if( iurl < this.tryMax ){
                    run()
                }else{
                    failRes(this)
                }
            })
        }

        run()

        return prom;
    }

    app(name:string) {
        const urls = this.conf.eureka.api.map( u => u+"/apps/"+name )
        if( urls.length<1 )throw new Error("conf.eureka.api.length < 1")

        let iurl = -1
        let succRes : (c:AppQuery)=>any = ()=>{}
        let failRes : (c:any)=>any = ()=>{}
        const prom = new Promise<AppQuery>((resolve, reject) => { 
            succRes = resolve
            failRes = reject
        });

        const run = ()=>{
            iurl++
            const url =  urls[(iurl % urls.length)]
            aux.get(url).then(res=>{
                console.log(res.data)
                succRes(res.data)
            }).catch(res=>{
                console.log("fail app query")
                if( iurl < this.tryMax ){
                    run()
                }else{
                    failRes(this)
                }
            })
        }

        run()

        return prom;
    }
}

export default Client;