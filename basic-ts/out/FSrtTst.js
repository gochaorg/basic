"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var bfind = __importStar(require("./FSrt"));
var arr1 = ['a', 'b', 'r', 'r', 'c', 'd', 'f', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'e', 'z', 'aa', 'ab'];
var srtFn = function (a, b) { return a.localeCompare(b); };
arr1 = arr1.sort(srtFn);
console.log("arr:", arr1);
console.log(bfind.find(arr1, srtFn, 'r'));
//# sourceMappingURL=FSrtTst.js.map