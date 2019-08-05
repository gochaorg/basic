"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const bfind = __importStar(require("../../ts/common/Finds"));
let arr1 = ['a', 'b', 'r', 'r', 'c', 'c', 'd', 'f', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'e', 'z', 'aa', 'ab'];
const srtFn = (a, b) => a.localeCompare(b);
arr1 = arr1.sort(srtFn);
console.log("arr:", arr1);
console.log(bfind.find(arr1, srtFn, 'r'));
console.log(bfind.findFirst(arr1, srtFn, 'c'));
//# sourceMappingURL=FindsTest.js.map