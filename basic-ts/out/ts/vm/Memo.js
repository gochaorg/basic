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
    Memo.prototype.read = function (varname) {
        console.log("debug read var " + varname);
        return this.values[varname];
    };
    /**
     * Запись значения памяти
     * @param varname имя переменной
     * @param value значение переменной
     */
    Memo.prototype.write = function (varname, value) {
        console.log("debug write var " + varname + " = " + value);
        var old = this.values[varname];
        this.values[varname] = value;
        for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
            var ls = _a[_i];
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