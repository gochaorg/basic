"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Num_1 = require("../Num");
/**
 * Перемещаемый указатель по массиву
 */
var Pointer = /** @class */ (function () {
    /**
     * Конструктор
     * @param entries текст
     */
    function Pointer(entries) {
        /**
         * Сохраненный стек указателей
         */
        this.stack = [];
        this.pointerValue = 0;
        this.entries = entries;
    }
    Object.defineProperty(Pointer.prototype, "ptr", {
        /**
         * Возвращает указатель
         */
        get: function () {
            return this.pointerValue;
        },
        /**
         * Устанавливает текущий казатель
         */
        set: function (v) {
            this.pointerValue = Num_1.asInt(v);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Pointer.prototype, "eof", {
        /**
         * Возвращает прзнак что указать достигнул конец списка элементов
         */
        get: function () {
            return this.ptr >= this.entries.length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Смещение указателя на указанное число элементов
     * @param n число элементов
     */
    Pointer.prototype.move = function (n) {
        this.pointerValue += Num_1.asInt(n);
        return this.pointerValue;
    };
    /**
     * Сохранение текущего указателя в стеке
     */
    Pointer.prototype.push = function () {
        this.stack.push(this.ptr);
    };
    /**
     * Чтение сохраненного указателя из стека
     */
    Pointer.prototype.peek = function () {
        if (this.stack.length <= 0)
            return null;
        return this.stack[this.stack.length - 1];
    };
    /**
     * Восстановление текущего указатель из стека с удалением значения из стека
     */
    Pointer.prototype.pop = function () {
        if (this.stack.length <= 0)
            throw new Error("stack is empty");
        var v = this.stack.pop();
        if (v !== undefined) {
            this.ptr = v;
        }
        return this.ptr;
    };
    /**
     * Удаление верхнего элемента стека без восстановления указателя
     */
    Pointer.prototype.drop = function () {
        if (this.stack.length <= 0)
            throw new Error("stack is empty");
        this.stack.pop();
        return this.ptr;
    };
    /**
     * Полчение значения
     * @param off смещение от текущей позиции
     */
    Pointer.prototype.get = function (off) {
        if (off === void 0) { off = 0; }
        var t = this.ptr + off;
        if (t >= 0 && t < this.entries.length) {
            return this.entries[t];
        }
        return null;
    };
    /**
     * Получение массива значений
     * @param off смещение от текущей позиции
     * @param cnt максимальное кол-во значений
     */
    Pointer.prototype.fetch = function (off, cnt) {
        if (off === void 0) { off = 0; }
        if (cnt === void 0) { cnt = 1; }
        var res = [];
        var start = this.ptr + off;
        if (cnt <= 0)
            return res;
        for (var i = 0; i < cnt; i++) {
            var ti = start + i;
            if (ti >= 0 && ti < this.entries.length) {
                res.push(this.entries[ti]);
            }
        }
        return res;
    };
    /**
     * Получение массива значений
     * @param cnt максимальное кол-во значений
     */
    Pointer.prototype.gets = function (cnt) {
        if (cnt === void 0) { cnt = 1; }
        return this.fetch(0, cnt);
    };
    return Pointer;
}());
exports.Pointer = Pointer;
//# sourceMappingURL=Pointer.js.map