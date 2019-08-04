"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
app.get('/', function (req, res) {
    res.send("hello");
});
app.get('/info', function (req, res) {
    res.send("hello");
});
app.get('/sum/:a/:b', function (req, res, next) {
    var a = req.params.a;
    var b = req.params.b;
    if (a !== undefined && b !== undefined && parseFloat(a) !== NaN && parseFloat(b) !== NaN) {
        var c = parseFloat(a) + parseFloat(b);
        res.json({ sum: c });
        console.log("request " + req.url + " from ip:" + req.ip);
        next();
    }
    else {
        var msg = "catch " + req.url;
        msg += "<br/>";
        msg += "<pre>";
        msg += "" + JSON.stringify(req.params, undefined, 2);
        msg += "</pre>";
        res.send(msg);
    }
});
var httpServ = app.listen(3000, function () {
    console.log("http started");
    //httpServ.clo
});
//# sourceMappingURL=sample1.js.map