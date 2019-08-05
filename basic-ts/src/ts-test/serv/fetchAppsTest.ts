import eureka = require('../../ts/serv/EurekaClient');

const euClient : eureka.Client = new eureka.Client({
    eureka:{
        api:[
            'http://localhost:8701/eureka',
            'http://localhost:8702/eureka',
        ]
    }
})

// console.log("fetch services")

// let pause1 = setTimeout(()=>{
//     console.log("wait finished")
// },5000)

// euClient.apps().then( 
//     (appz:eureka.Apps)=>{
//         clearTimeout(pause1)
//         console.log("accepted services:")
//         console.log(appz)
//         appz.applications.application.forEach( app => {
//             console.log(`==== app ${app.name} ===`)
//             console.log(app.instance)
//         })
//     } 
// )

console.log("////////////////////////////////////////")

let pause2 = setTimeout(()=>{
    console.log("wait finished")
},5000)
euClient.app("sample1").then( app => {
    clearInterval(pause2)
    console.log(`=== ${app.application.name} ===`)
    console.log(app.application.instance)
})