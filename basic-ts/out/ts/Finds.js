"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Num_1 = require("./Num");
/**
 * Поиск занчения в отсортированном массиве
 * @param arr массив
 * @param cmp функция сравнения
 * @param need искомое значение
 * @param beginIndex начало области поиска
 * @param endIndexExc конец области поиска
 */
function find(arr, cmp, need, beginIndex, endIndexExc) {
    //console.log('find:',{beginIndex:beginIndex, endIndexExc:endIndexExc, need:need})
    var res = [];
    var found = -1;
    if (arr != undefined && cmp != undefined && arr.length > 0) {
        if (beginIndex == undefined) {
            beginIndex = 0;
        }
        if (endIndexExc == undefined) {
            endIndexExc = arr.length;
        }
        var finish = false;
        while (!finish) {
            // Область поиска
            var areaSize = endIndexExc - beginIndex;
            if (areaSize > 0) {
                // Есть среди чего искать
                if (areaSize == 1) {
                    var v = arr[beginIndex];
                    //console.log('find area:',{beginIndex:beginIndex, endIndexExc:endIndexExc, areaSize:areaSize, value:v})
                    if (cmp(v, need) == 0) {
                        //console.log('found:',{index:beginIndex, value:v})
                        found = beginIndex;
                        res.push(beginIndex);
                    }
                    finish = true;
                    break;
                }
                else {
                    var iMiddle = Num_1.asInt(beginIndex + areaSize / 2);
                    var vMiddle = arr[iMiddle];
                    var cMiddle = cmp(need, vMiddle);
                    //console.log('find area:',{beginIndex:beginIndex, endIndexExc:endIndexExc, areaSize:areaSize, index:iMiddle, value:vMiddle, cmp:cMiddle})                    
                    if (cMiddle < 0) {
                        endIndexExc = iMiddle;
                        //console.log('jump left:',{beginIndex:beginIndex, endIndexExc:endIndexExc})
                        continue;
                    }
                    else if (cMiddle == 0) {
                        endIndexExc = iMiddle;
                        //console.log('found:',{index:iMiddle, value:vMiddle})
                        // скан до левой границы
                        if (iMiddle > beginIndex) {
                            for (var i2 = iMiddle - 1; i2 >= beginIndex; i2--) {
                                var v2 = arr[i2];
                                if (cmp(v2, need) == 0) {
                                    res.push(i2);
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        res.push(iMiddle);
                        found = iMiddle;
                        // скан до правой границы
                        if ((iMiddle + 1) < endIndexExc) {
                            for (var i3 = iMiddle + 1; i3 < endIndexExc; i3++) {
                                var v2 = arr[i3];
                                if (cmp(v2, need) == 0) {
                                    res.push(i3);
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        continue;
                    }
                    else {
                        beginIndex = iMiddle;
                        //console.log('jump right:',{beginIndex:beginIndex, endIndexExc:endIndexExc})
                        continue;
                    }
                }
            }
        }
    }
    if (res.length > 1)
        res = res.sort();
    //console.log("found:",{found:found})
    if (found >= 0) {
        res = [found];
        var scanRight = arr.length;
        if ((found + 1) < scanRight) {
            for (var i3 = found + 1; i3 < scanRight; i3++) {
                var v2 = arr[i3];
                if (cmp(v2, need) == 0) {
                    res.push(i3);
                }
                else {
                    break;
                }
            }
        }
    }
    return res;
}
exports.find = find;
/**
 * Поиск занчения в отсортированном массиве
 * @param arr массив
 * @param cmp функция сравнения
 * @param need искомое значение
 * @param beginIndex начало области поиска
 * @param endIndexExc конец области поиска
 */
function findFirst(arr, cmp, need, beginIndex, endIndexExc) {
    //console.log('find:',{beginIndex:beginIndex, endIndexExc:endIndexExc, need:need})
    var found = -1;
    if (arr != undefined && cmp != undefined && arr.length > 0) {
        if (beginIndex == undefined) {
            beginIndex = 0;
        }
        if (endIndexExc == undefined) {
            endIndexExc = arr.length;
        }
        var finish = false;
        while (!finish) {
            // Область поиска
            var areaSize = endIndexExc - beginIndex;
            if (areaSize > 0) {
                // Есть среди чего искать
                if (areaSize == 1) {
                    var v = arr[beginIndex];
                    //console.log('find area:',{beginIndex:beginIndex, endIndexExc:endIndexExc, areaSize:areaSize, value:v})
                    if (cmp(v, need) == 0) {
                        //console.log('found:',{index:beginIndex, value:v})
                        found = beginIndex;
                    }
                    finish = true;
                    break;
                }
                else {
                    var iMiddle = Num_1.asInt(beginIndex + areaSize / 2);
                    var vMiddle = arr[iMiddle];
                    var cMiddle = cmp(need, vMiddle);
                    //console.log('find area:',{beginIndex:beginIndex, endIndexExc:endIndexExc, areaSize:areaSize, index:iMiddle, value:vMiddle, cmp:cMiddle})                    
                    if (cMiddle < 0) {
                        endIndexExc = iMiddle;
                        //console.log('jump left:',{beginIndex:beginIndex, endIndexExc:endIndexExc})
                        continue;
                    }
                    else if (cMiddle == 0) {
                        endIndexExc = iMiddle;
                        //console.log('found:',{index:iMiddle, value:vMiddle})
                        // скан до левой границы
                        found = iMiddle;
                        if (iMiddle > beginIndex) {
                            for (var i2 = iMiddle - 1; i2 >= beginIndex; i2--) {
                                var v2 = arr[i2];
                                if (cmp(v2, need) == 0) {
                                    found = beginIndex;
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        continue;
                    }
                    else {
                        beginIndex = iMiddle;
                        continue;
                    }
                }
            }
        }
    }
    return found;
}
exports.findFirst = findFirst;
//# sourceMappingURL=Finds.js.map