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
        /**
         * Выводить на консоль изменения памяти
         */
        this.debug = false;
        /**
         * Игнорирование регистра символов в именах переменных
         */
        this.ignoreCase = true;
    }
    /**
     * Чтение значения
     * @param varname имя переменной
     */
    Memo.prototype.read = function (varname, indexes) {
        var v = this.values[varname];
        if (v == undefined && this.ignoreCase) {
            var matched = Object.keys(this.values).filter(function (x, y, z) {
                return x.toUpperCase() == varname.toUpperCase();
            });
            if (matched.length > 0) {
                v = this.values[matched[0]];
            }
        }
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
            if (this.debug)
                console.log("debug read var " + varname + "[" + arr + "] = " + v);
            return v;
        }
        return v;
    };
    Memo.prototype.emit = function (varname, from, to, indexes) {
        for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
            var ls = _a[_i];
            ls(varname, from, to, indexes);
        }
    };
    /**
     * Запись значения памяти
     * @param varname имя переменной
     * @param value значение переменной
     */
    Memo.prototype.write = function (varname, value, indexes) {
        var _this = this;
        var aindexes = [];
        if (indexes) {
            for (var _i = 0, indexes_2 = indexes; _i < indexes_2.length; _i++) {
                var a = indexes_2[_i];
                aindexes.push(a);
            }
        }
        if (indexes) {
            var arr = [];
            var v = this.values[varname];
            if (v == undefined && this.ignoreCase) {
                var matchedVarNames = Object.keys(this.values).filter(function (x, y, z) {
                    return x.toUpperCase() == varname.toUpperCase();
                });
                if (matchedVarNames.length > 0) {
                    v = this.values[matchedVarNames[0]];
                }
            }
            if (v instanceof Array
                || v instanceof Object) {
                arr = v;
                if (this.debug)
                    console.log("resolved " + varname + " as []");
            }
            else {
                var matchedVarNames = Object.keys(this.values).filter(function (x, y, z) {
                    return x.toUpperCase() == varname.toUpperCase();
                });
                matchedVarNames.forEach(function (mname) {
                    if (mname != varname) {
                        var old_1 = _this.values[mname];
                        delete _this.values[mname];
                        _this.emit(mname, old_1, undefined);
                    }
                });
                this.values[varname] = arr;
                if (this.debug)
                    console.log("assign " + varname + " = []");
            }
            while (indexes.length > 1) {
                var idx = indexes[0];
                indexes.splice(0, 1);
                if (arr[idx] instanceof Object || arr[idx] instanceof Array) {
                    arr = arr[idx];
                    if (this.debug)
                        console.log("resolved [" + idx + "] as " + typeof (arr));
                }
                else {
                    arr[idx] = [];
                    arr = arr[idx];
                    if (this.debug)
                        console.log("assign [" + idx + "] = []");
                }
            }
            var old = undefined;
            if (indexes.length == 1) {
                var idx = indexes[0];
                old = arr[idx];
                arr[idx] = value;
                if (this.debug)
                    console.log("assign [" + idx + "] = " + value);
            }
            this.emit(varname, old, value, aindexes);
            return;
        }
        if (this.debug)
            console.log("debug write var " + varname + " = " + value);
        if (this.ignoreCase) {
            var matched = Object.keys(this.values).filter(function (x, y, z) {
                return x.toUpperCase() == varname.toUpperCase();
            });
            matched.forEach(function (n) {
                if (n != varname) {
                    var old_2 = _this.values[n];
                    delete _this.values[n];
                    _this.emit(n, old_2, undefined);
                }
            });
            var old = this.values[varname];
            this.values[varname] = value;
            this.emit(varname, old, value);
        }
        else {
            var old = this.values[varname];
            this.values[varname] = value;
            this.emit(varname, old, value);
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