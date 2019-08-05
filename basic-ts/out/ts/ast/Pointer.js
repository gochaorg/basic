"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Num_1 = require("../common/Num");
/**
 * Перемещаемый указатель по массиву
 */
class Pointer {
    /**
     * Конструктор
     * @param entries текст
     */
    constructor(entries) {
        /**
         * Сохраненный стек указателей
         */
        this.stack = [];
        this.pointerValue = 0;
        this.entries = entries;
    }
    /**
     * Возвращает указатель
     */
    get ptr() {
        return this.pointerValue;
    }
    /**
     * Устанавливает текущий казатель
     */
    set ptr(v) {
        this.pointerValue = Num_1.asInt(v);
    }
    /**
     * Возвращает прзнак что указать достигнул конец списка элементов
     */
    get eof() {
        return this.ptr >= this.entries.length;
    }
    /**
     * Смещение указателя на указанное число элементов
     * @param n число элементов
     */
    move(n) {
        this.pointerValue += Num_1.asInt(n);
        return this.pointerValue;
    }
    /**
     * Сохранение текущего указателя в стеке
     */
    push() {
        this.stack.push(this.ptr);
    }
    /**
     * Чтение сохраненного указателя из стека
     */
    peek() {
        if (this.stack.length <= 0)
            return null;
        return this.stack[this.stack.length - 1];
    }
    /**
     * Восстановление текущего указатель из стека с удалением значения из стека
     */
    pop() {
        if (this.stack.length <= 0)
            throw new Error("stack is empty");
        const v = this.stack.pop();
        if (v !== undefined) {
            this.ptr = v;
        }
        return this.ptr;
    }
    /**
     * Удаление верхнего элемента стека без восстановления указателя
     */
    drop() {
        if (this.stack.length <= 0)
            throw new Error("stack is empty");
        this.stack.pop();
        return this.ptr;
    }
    /**
     * Полчение значения
     * @param off смещение от текущей позиции
     */
    get(off = 0) {
        let t = this.ptr + off;
        if (t >= 0 && t < this.entries.length) {
            return this.entries[t];
        }
        return null;
    }
    /**
     * Получение массива значений
     * @param off смещение от текущей позиции
     * @param cnt максимальное кол-во значений
     */
    fetch(off = 0, cnt = 1) {
        const res = [];
        const start = this.ptr + off;
        if (cnt <= 0)
            return res;
        for (let i = 0; i < cnt; i++) {
            let ti = start + i;
            if (ti >= 0 && ti < this.entries.length) {
                res.push(this.entries[ti]);
            }
        }
        return res;
    }
    /**
     * Получение массива значений
     * @param cnt максимальное кол-во значений
     */
    gets(cnt = 1) { return this.fetch(0, cnt); }
}
exports.Pointer = Pointer;
//# sourceMappingURL=Pointer.js.map