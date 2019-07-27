"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TreeIt_1 = require("../ts/common/TreeIt");
var treedata = {
    // parent -> children
    "a": ["b", "c"],
    "b": ["d", "e"],
    "c": ["f", "g"],
    "d": ["h", "i"]
};
console.log(TreeIt_1.TreeIt.list("a", function (n) {
    var ch = treedata[n];
    if (ch) {
        return ch;
    }
    return [];
}).map(function (x) { return x.path.reduce(function (a, b) { return a + "/" + b; }); }));
var arr = [1];
var r1 = arr.reduce(function (a, b) { console.log("reduce=", a, b); return a + b; }, 0);
console.log(r1);
//# sourceMappingURL=TreeItTest.js.map