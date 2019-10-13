import aux, { AxiosRequestConfig } from 'axios';
import { url } from 'inspector';

export type ClientStatus = "UP" | "DOWN" | "STARTING" | "OUT_OF_SERVICE" | "UNKNOWN"
export type DataCenter = "MyOwn" | "Amazon"

/**
 * Регистрация сервиса-клиента
 */
export interface Registry {
    /** Идентификатор экземпляра */
    instanceId?: string

    /** Адрес хоста, например: "localhost" */
    hostName: string,

    /** Имя сервиса/приложения, например: "sample1" */
    app: string,

    /** virtual ip, не понятное предназначение, некий адрес сервиса 
     * и чем он отличается от ipAddr не понятно.
     * 
     * Пример: "localhost"
     */
    vipAddress?: string,

    /** virtual ip, не понятное предназначение, некий адрес сервиса 
     * и чем он отличается от ipAddr не понятно.
     * 
     * Пример: "localhost"
     */
    secureVipAddress?: string,

    /** Адрес сервиса.
     * 
     * Пример: "127.0.0.1"
     */
    ipAddr: string,

    /** Статсус в которм сейчас находиться прилоежение */
    status: ClientStatus,


    //"port": {"$": "3000", "@enabled": "true"},
    /** Номер сетевого порта, например: 3000 */
    port:number,

    //"securePort": {"$": "3001", "@enabled": "true"},
    /** Номер сетевого порта для SSL/TLS */
    securePort?:number,

    /** Адрес для проверки доступнсти
     * 
     * Пример: "http://127.0.0.1:3000/info"
    */
    healthCheckUrl?: string,

    /**
     * Адрес для проверки статуса, не известно чем отличаеться от healthCheckUrl.
     * 
     * Пример: "http://127.0.0.1:3000/info"
     */
    statusPageUrl?: string,

    /**
     * Адрес домашней страницы,  не известно чем отличаеться от healthCheckUrl.
     * 
     * Пример: "http://127.0.0.1:3000"
     */
    homePageUrl: string,

    // "dataCenterInfo": {
    //     "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo", 
    //     "name": "MyOwn"
    // }

    /**
     * Тип облака, вообще для собственных целей подойдет "MyOwn"
     */
    dataCenter?: DataCenter,

    /**
     * Информация о доступности сервиса, с какой периодичностью опрашивать ...
     */
    leaseInfo?: {
        /**
         * Интервал в секундах, назначение до конца не понятно
         */
        renewalIntervalInSecs?: number,

        /**
         * Интервал в секундах, назначение до конца не понятно
         */
        durationInSecs?:number
        //evictionDurationInSecs?: number
    }
}

/**
 * Настройки сетевого расположения eureka серверов
 */
export interface EurekaConfig {
    /**
     * Адреса на которых располагаются eureka api:
     * [ 'http://localhost:8701/eureka', 'http://localhost:8702/eureka' ]
     */
    api:string[]
}

/**
 * Конфигурация клиентов
 */
export interface ClientConfig {
    registry? : Registry
    eureka: EurekaConfig,

    /** Описывает стратегию повторных запросов */
    retry? : {
        /** Максимальное кол-во повторных запросов */
        tryMax? : number
    }
}

/** Описывает сетевой порт */
export interface NetPort {
    /** Номер сетевого порта */
    "$": number

    /** Порт разрешен/запрешен */
    "@enabled": boolean
}

/** Описывает доступность экземпляра сервиса */
export interface Instance {
    /** Идентификатор экземляра */
    instanceId?:string

    /** Адрес/имя хоста */
    hostName:string

    /** Имя сервиса */
    app:string

    /** ip адрес */
    ipAddr:string

    /** Статус сервиса */
    status:ClientStatus

    /** Некое переопределение статуса, хз зачем */
    overriddenStatus?:ClientStatus

    /** Сетевой порт */
    port: NetPort

    /** Сетевой порт для защищенных соединений (SSL/TLS) */
    securePort?: NetPort

    /** Номер страны */
    countryId?: number

    /** Информация о datacenter-е */
    dataCenterInfo?: {
        "@class": string
        name: string
    }

    /** Информация о доступности сервиса */
    leaseInfo: {
        renewalIntervalInSecs: number
        durationInSecs: number
        registrationTimestamp: number
        lastRenewalTimestamp: number
        evictionTimestamp: number
        serviceUpTimestamp: number
    }

    /** Домашняя страница сервиса */
    homePageUrl?: string

    /** Адрес страницы для проверки статуса */
    statusPageUrl?: string

    /** Адрес страницы для проверки состояния */
    healthCheckUrl?: string

    /** не известно */
    isCoordinatingDiscoveryServer?: boolean

    /** предположительно - время последнего обновления */
    lastUpdatedTimestamp: number

    /** не известно */
    lastDirtyTimestamp: number

    /** не известно */
    actionType: string
}

/** Информация о доступности сервиса */
export interface App {
    /** Имя сервиса */
    name: string,

    /** Сетевое расположение сервиса */
    instance: Instance[]
}

/** Запрос для получения информации о сервисе */
export interface AppQuery {
    /** Информация о доступности сервиса */
    application: App
}

/** Запрос о доступности сервисов */
export interface Apps {
    /** информация о доступности сервисов */
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

    /** 
     * Конструктор 
     * @param conf Конфигурация клиента
     */
    constructor(conf: ClientConfig){
        if( conf.eureka.api.length<1 ){
            throw new Error("conf.eureka.api.length<1")
        }
        this.conf = conf
    }

    /** 
     * Получение адресов для регистрации приложения 
     * @param appId Имя сервиса
     * @returns список адресов куда направлять запросы на регистрацию
     */
    protected registryUrl(appId:string):string[] {
        return this.conf.eureka.api.map( api=>api+"/apps/"+appId )
    }

    /**
     * Возвращает идентификатор экземпляра.
     * 
     * В параметрах конфигурации должен быть указано значение `conf.registry`.
     * 
     * Идентификатор может быть указан conf.registry.instanceId, 
     * если не указан, то формируеться из:
     * `conf.registry.hostName + ':' + conf.registry.port + ':' + this.conf.registry.app`
     * @returns идентификатор экземпляра
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

    /** Описывает стратегию повторных запросов */
    get retry() {
        const self = this
        return {
            /**
             * Возвращает максимальное кол-во попыток повторынх запросов
             */
            get tryMax():number { 
                if( self.conf && self.conf.retry && self.conf.retry.tryMax ){
                    return self.conf.retry.tryMax;
                }
                return 10; 
            }
        }
    }

    private clientStarted:boolean = false

    /** Указывает зарегистрирован ли клиент как сервис в eureka */
    get started():boolean { return this.clientStarted }

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

        if( cfg.leaseInfo ){
            data.leaseInfo = {}
            if( cfg.leaseInfo.durationInSecs ){
                data.leaseInfo.durationInSecs = cfg.leaseInfo.durationInSecs
                this.prefferedHeartbeatInterval = cfg.leaseInfo.durationInSecs*1000
            }
            if( cfg.leaseInfo.renewalIntervalInSecs ){
                data.leaseInfo.renewalIntervalInSecs = cfg.leaseInfo.renewalIntervalInSecs
            }
        }

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

            console.log(`try registry ${cfg.app}`, data)
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
                if( iurl < this.retry.tryMax ){
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

    /** Возвращает url по которому происходит отписка от регистрации */
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
                if( iurl < this.retry.tryMax ){
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
    private prefferedHeartbeatInterval : number | undefined = undefined
    get heartbeatInterval():number {
        if( this.prefferedHeartbeatInterval )return this.prefferedHeartbeatInterval
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

    /**
     * Возвращает url по которым посылаеться сигнал hearbeat
     * @param appId имя сервиса
     * @param instId идентификатор сервиса
     */
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
                if( iurl < this.retry.tryMax ){
                    run()
                }else{
                    failRes(this)
                }
            })
        }

        run()

        return prom;
    }

    /** Получение информации о сервисах */
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
                if( iurl < this.retry.tryMax ){
                    run()
                }else{
                    failRes(this)
                }
            })
        }

        run()

        return prom;
    }

    /** Получение информации о конкретном сервисе */
    async app(name:string):Promise<AppQuery> {
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
                //console.log(res.data)
                succRes(res.data)
            }).catch(res=>{
                console.log("fail app query")
                if( iurl < this.retry.tryMax ){
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

/** Учет статистики вызовов */
export class InstanceStat {
    maxEntries:number = 100

    readonly calls:{
        wait:number,
        time:number,
        succ:boolean
    }[] = []

    /** 
     * фиксирование информации о вызове сервиса
     * @param wait - ожидание в мс
     * @param succ - успешность вызова
     */
    collect(wait:number, succ:boolean){
        if( this.maxEntries>0 ){
            this.calls.push({wait:wait, time:Date.now(), succ:succ})
            while( this.calls.length>this.maxEntries ){
                this.calls.shift()
            }
        }
    }

    /** получение оперативной статистики о работе экземпляра сервиса */
    get stat() {
        const waits = this.calls.map( i=>i.wait ).reduce( (a,b)=>a+b )
        const total = this.calls.length
        const success = this.calls.filter( i => i.succ ).length
        const fails = this.calls.filter( i => i.succ==false ).length
        const avg = total>0 ? waits / total : 0
        return {
            accessibility: {
                total: total,
                success: success,
                fails: fails,
                pct: total>0 ? 100 * success / total : -1
            },
            times: {
                waits: waits,
                avg: avg
            }
        }
    }
}

/** Сервис который зарегистрирован в eureka */
class Service {
    /** клиент Eureka */
    readonly eu:Client

    /** список экземпляров */
    instances:Instance[] = []
    
    /** время когда был получен список экземпляров  */
    protected instFetchDate : number | undefined = undefined

    /** таймаут (мс) после которого необходимо запросить новый список сервисов */
    protected renewInstTimeout : number | undefined = undefined

    /** инициализация - промис для получения информации о сервисе */
    protected initAppProm : Promise<any>

    /** инициализация завершена */
    protected initFinished = false

    /** инициализация завершена успешно */
    protected initSuccess = false
    
    /**
     * Конструктор
     * @param eu клиент eureka
     * @param name имя сервиса
     */
    constructor( eu:Client, name:string ){
        this.eu = eu
        this.initAppProm =
        eu.app(name).then( appInfo => {
                this.instances = appInfo.application.instance
                // console.log(
                //     `sucess fetch app "${name}" urls:`,
                //     this.serviceUrlPrefix().map( i => i.url )
                // )
                this.initFinished = true
                this.initSuccess = true
                this.instFetchDate = Date.now()
                this.renewInstTimeout = this.instances.
                    map( inst => inst.leaseInfo.renewalIntervalInSecs ).
                    map( sec => sec * 1000 ).
                    reduce( (a,b) => a<b ? a : b )
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

    protected reinitStartDate : number | undefined = undefined

    /** Повторная инициализация */
    protected async reinit() {
        this.log.reinit.started()
        this.reinitStartDate = Date.now()
        this.eu.app(name).then( appInfo => {
            this.instances = appInfo.application.instance
            this.initFinished = true
            this.initSuccess = true
            this.instFetchDate = Date.now()
            this.renewInstTimeout = this.instances.
                map( inst => inst.leaseInfo.renewalIntervalInSecs ).
                map( sec => sec * 1000 ).
                reduce( (a,b) => a<b ? a : b )
            this.log.reinit.success()
        }).catch( err => {
            this.log.reinit.error(err)
            //this.initFinished = true
            //this.initSuccess = false
        })
    }

    /** проверка завершения инициализации */
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

    protected roundRobinIndex = -1

    /** логирование */
    readonly log = {
        print:(message:any)=>{},
        request: {
            begin:(url:string,opts?:any)=>{
                const ent : {[name:string]:any} = {}
                ent.url = url
                ent.state = "begin"
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
                ent.state = "end"
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
        },
        reinit: {
            error: (err:any) => this.log.print({method:"reinit",state:"error",error:err}),
            success: ()=> this.log.print({method:"reinit",state:"success"}),
            started: ()=> this.log.print({method:"reinit",state:"started"})
        }
    }

    /** статистика по экземплярам */
    readonly stat:{[instId:string]:InstanceStat} = {}

    /** учет статистики вызова экземпляра */
    protected collect( instId:string, waitTime:number, succ:boolean) {
        let instSt = this.stat[instId]
        if( !instSt ){
            instSt = new InstanceStat()
            this.stat[instId] = instSt
        }
        instSt.collect( waitTime, succ )
    }

    /** выполнение get запроса к сервису
     * @param url - адрес, 
     * если указан адрес относительно корня, без http и домена/ip (например /method/arg1/arg2?blabla),
     * тогда будет задествован механизм обработки отказов faultTolerance
     * @param config - конфигурация axios
     * @returns результат вызова
     */
    async get(url:string, config?: AxiosRequestConfig) {
        // ожидание инициализации
        await this.checkInited()

        // проверка необходимости повторной инициализации списка сервисов
        if( this.renewInstTimeout && this.renewInstTimeout>0 ){
            // определенно время последней инициализации
            if( this.instFetchDate ){
                // подсчет сколько прошло времени
                const tdiff = Date.now() - this.instFetchDate
                
                // проверка - вышел ли таймацт и требуется повторная инициализация
                if( tdiff>=this.renewInstTimeout ){
                    // проверяем сколько прошло времени с последнего вызова повторной инициализации
                    const tdiff2 = this.reinitStartDate ? Date.now() - this.reinitStartDate : this.renewInstTimeout*2
                    if( tdiff2>=this.renewInstTimeout ){
                        // с повторной инициализации прошло достаточно времени, вызываем повторную инициализацю
                        this.reinit()
                    }
                }
            }
        }

        this.log.request.begin(url,{method:"get"})

        const absAddr = url.startsWith('http:') || url.startsWith('https:')
        const firstSlash = url.startsWith('/')

        if( absAddr ){
            // вызов конкретного экземпляра
            try {
                this.log.request.call(url,1,1)
                const res = await aux.get(url,config)
                this.log.request.end(url)
                return res
            } catch ( err ) {
                this.log.request.end(url,err)
                throw err
            }
        }else{
            // берем очередной экземпляр по кругу 
            this.roundRobinIndex++

            const srvcUrls = this.serviceUrlPrefix()
            if( srvcUrls.length<1 )throw new Error("service base url not defined")

            // номер попытки            
            let urli = 0
            
            // максимальное кол-во поыток
            const tryMax = 10

            // сопоставление экземпляра и его идентификатора
            const instId = (inst:Instance):string => {
                if( inst.instanceId ){
                    return inst.instanceId
                }
                return `${inst.ipAddr}:${inst.port.$}:${inst.app}`
            }
            
            // засекаем время и кол-во попыток
            const t0 = Date.now()
            let tsum = 0
            let tcnt = 0            
            while( true ){
                // засекаем время (начало) вызова
                const t1 = Date.now()
                const collectTime = (inst:Instance,succ:boolean)=>{
                    // засекаем время (конец) вызова
                    const t2 = Date.now()
                    const treq = t2 - t1
                    tcnt++
                    tsum += treq

                    // фиксируем время и успешность вызова
                    this.collect(instId(inst), treq, succ)
                    return {
                        calls: tcnt,
                        times: {
                            summary: tsum,
                            avg: (tcnt>0 ? tsum / tcnt : 0)
                        }
                    }
                }

                // берем очередной экземпляр и делаем попытку вызова
                urli++
                const inst = srvcUrls[
                    (urli + this.roundRobinIndex) % srvcUrls.length
                ]
                // получаем целевой адрес
                const targetUrl = inst.url+(firstSlash ? url : '/'+url)
                const attempt = urli
                try {
                    // делаем вызов
                    this.log.request.call(targetUrl,attempt,tryMax)
                    const res = await aux.get( targetUrl, config )
                    this.log.request.end(targetUrl,undefined,collectTime(inst.instance, true))

                    // возвращаем результат
                    return res
                } catch( err ){
                    // ведем учет общего времени на данный метод get
                    const t2 = Date.now()
                    const treq = t2 - t1
                    tcnt++
                    tsum += treq

                    // фиксируем ошибку вызова в статистике на данный экземпляр
                    const x = collectTime(inst.instance, false)
                    if( urli>=tryMax ){
                        // кол-во вызовов превысело максимальное допустимое
                        this.log.request.end(url,err,x)
                        throw err
                    }else{
                        this.log.request.callFail(targetUrl,attempt,tryMax)
                    }
                }
            }
        }
    }
}

//export default Client, InstanceStat;