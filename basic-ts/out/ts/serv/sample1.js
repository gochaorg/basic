"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
app.get('/', function (req, res) {
    res.send("hello");
});
app.get('/*.bas', function (req, res) {
    res.send("catch " + req.url);
});
app.listen(3000, function () {
    console.log("started");
});
//# sourceMappingURL=sample1.js.map