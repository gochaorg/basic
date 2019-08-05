"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeIt_1 = require("../../ts/common/TreeIt");
let treedata = {
    // parent -> children
    "a": ["b", "c"],
    "b": ["d", "e"],
    "c": ["f", "g"],
    "d": ["h", "i"]
};
console.log(TreeIt_1.TreeIt.list("a", (n) => {
    let ch = treedata[n];
    if (ch) {
        return ch;
    }
    return [];
}).map(x => x.path.reduce((a, b) => a + "/" + b)));
let arr = [1];
let r1 = arr.reduce((a, b) => { console.log("reduce=", a, b); return a + b; }, 0);
console.log(r1);
//# sourceMappingURL=TreeItTest.js.map