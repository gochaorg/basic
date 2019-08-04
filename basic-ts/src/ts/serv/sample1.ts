// import http = require('http');
// const originalRequest = http.request; 
// // override the function
// http.request = function wrapMethodRequest(req) {
//   console.log(req.host, req.body);
//   // do something with the req here
//   // ...
//   // call the original 'request' function   
//   return originalRequest.apply(this, arguments);
// }

import express = require('express');

const app: express.Application = express()

app.get('/',(req,res)=>{
    res.send("hello")
});

app.get('/info',(req,res)=>{
    res.send("hello")
});

app.get('/sum/:a/:b',(req,res,next)=>{
    let a = req.params.a;
    let b = req.params.b;
    if( a!==undefined && b!==undefined && parseFloat(a)!==NaN && parseFloat(b)!==NaN ){
        let c = parseFloat(a) + parseFloat(b)
        res.json( {sum:c} )
        console.log(`request ${req.url} from ip:${req.ip}`)
        next()
    }else{
        let msg = `catch ${req.url}`
        msg += `<br/>`
        msg += "<pre>"
        msg += `${JSON.stringify(req.params,undefined,2)}`
        msg += "</pre>"
        res.send(msg)
    }
});

const httpServ = app.listen(3000,()=>{
    console.log("http started")
    
    //httpServ.clo
});
