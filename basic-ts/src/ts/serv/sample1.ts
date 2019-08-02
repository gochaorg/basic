import express = require('express');

const app: express.Application = express()

app.get('/',(req,res)=>{
    res.send("hello")
});

app.get('/*.bas',(req,res)=>{
    res.send(`catch ${req.url}`)
});

app.listen(3000,()=>{
    console.log("started")
});