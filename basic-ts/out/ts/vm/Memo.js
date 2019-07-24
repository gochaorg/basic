"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Память VM
 */
var Memo = /** @class */ (function () {
    function Memo() {
        /**
         * Непочредственно значния
         */
        this.values = {};
        /**
         * Подписчики на изменения значений памяти VM
         */
        this.listeners = [];
    }
    /**
     * Чтение значения
     * @param varname имя переменной
     */
    Memo.prototype.read = function (varname, indexes) {
        var v = this.values[varname];
        if (indexes) {
            var arr = [];
            for (var _i = 0, indexes_1 = indexes; _i < indexes_1.length; _i++) {
                var a = indexes_1[_i];
                arr.push(a);
            }
            while (indexes.length > 0) {
                var idx = indexes[0];
                indexes.splice(0, 1);
                if (v instanceof Object || v instanceof Array) {
                    v = v[idx];
                }
                else {
                    v = undefined;
                    break;
                }
            }
            console.log("debug read var " + varname + "[" + arr + "] = " + v);
            return v;
        }
        return v;
    };
    /**
     * Запись значения памяти
     * @param varname имя переменной
     * @param value значение переменной
     */
    Memo.prototype.write = function (varname, value, indexes) {
        var aindexes = [];
        if (indexes) {
            for (var _i = 0, indexes_2 = indexes; _i < indexes_2.length; _i++) {
                var a = indexes_2[_i];
                aindexes.push(a);
            }
        }
        if (indexes) {
            var arr = [];
            if (this.values[varname] instanceof Array
                || this.values[varname] instanceof Object) {
                arr = this.values[varname];
                console.log("resolved " + varname + " as []");
            }
            else {
                this.values[varname] = arr;
                console.log("assign " + varname + " = []");
            }
            while (indexes.length > 1) {
                var idx = indexes[0];
                indexes.splice(0, 1);
                if (arr[idx] instanceof Object || arr[idx] instanceof Array) {
                    arr = arr[idx];
                    console.log("resolved [" + idx + "] as " + typeof (arr));
                }
                else {
                    arr[idx] = [];
                    arr = arr[idx];
                    console.log("assign [" + idx + "] = []");
                }
            }
            var old_1 = undefined;
            if (indexes.length == 1) {
                var idx = indexes[0];
                old_1 = arr[idx];
                arr[idx] = value;
                console.log("assign [" + idx + "] = " + value);
            }
            for (var _a = 0, _b = this.listeners; _a < _b.length; _a++) {
                var ls = _b[_a];
                ls(varname, old_1, value, aindexes);
            }
            return;
        }
        console.log("debug write var " + varname + " = " + value);
        var old = this.values[varname];
        this.values[varname] = value;
        for (var _c = 0, _d = this.listeners; _c < _d.length; _c++) {
            var ls = _d[_c];
            ls(varname, old, value);
        }
    };
    Object.defineProperty(Memo.prototype, "varnames", {
        get: function () {
            return Object.keys(this.values);
        },
        enumerable: true,
        configurable: true
    });
    return Memo;
}());
exports.Memo = Memo;
//# sourceMappingURL=Memo.js.map