"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Шаг очередной итерации
 */
class TreeStep {
    /**
     * Конструктор
     * @param value Значение узла дерева
     * @param parent Ссылка на родительский элемент дерева
     */
    constructor(value, parent) {
        this.value = value;
        this.parent = parent;
    }
    /**
     * Создание дочернего пути/шага при обходе дерева
     * @param value дочернее значение узла
     */
    follow(value) {
        return new TreeStep(value, this);
    }
    /**
     * Возвращает путь значений в дереве
     */
    get path() {
        let res = [];
        let ts = this;
        while (ts != undefined && ts != null) {
            res.push(ts.value);
            ts = ts.parent;
        }
        res.reverse();
        return res;
    }
}
exports.TreeStep = TreeStep;
/**
 * Итератор для обхода дерева
 */
class TreeIt {
    /**
     * Конструктор
     * @param start начальный узел дерева
     * @param follow функция перехода к дочерним узлам
     */
    constructor(start, follow) {
        this.follow = follow;
        this.current = [new TreeStep(start)];
    }
    /**
     * Проверяет наличие дочернего узла
     */
    hasNext() {
        return this.current.length > 0;
    }
    /**
     * Переход к следующему узлу в дереве
     */
    fetch() {
        if (this.current.length <= 0)
            return undefined;
        let res = this.current.splice(0, 1);
        //let res:T|undefined = this.current.pop()
        if (res != undefined) {
            res.forEach(r => {
                this.follow(r.value).forEach(n => this.current.push(r.follow(n)));
            });
        }
        if (res != undefined) {
            return res.length > 0 ? res[0] : undefined;
        }
        return undefined;
    }
    /**
     * Обход узлов дерева
     * @param start начальный узел дерева
     * @param follow функция перехода к дочерним узлам
     * @param consumer функция - визер узлов дерева
     */
    static each(start, follow, consumer) {
        if (start == null || start == undefined)
            throw new Error("illegal arg start");
        if (follow == null || follow == undefined)
            throw new Error("illegal arg follow");
        if (consumer == null || consumer == undefined)
            throw new Error("illegal arg consumer");
        const titer = new TreeIt(start, follow);
        while (titer.hasNext()) {
            let f = titer.fetch();
            if (f) {
                consumer(f);
            }
        }
    }
    /**
     * Разворчивание дерева в список
     * @param start начальный узел
     * @param follow функция перехода к дочерним узлам
     */
    static list(start, follow) {
        if (start == null || start == undefined)
            throw new Error("illegal arg start");
        if (follow == null || follow == undefined)
            throw new Error("illegal arg follow");
        let arr = [];
        TreeIt.each(start, follow, (n) => { arr.push(n); });
        return arr;
    }
}
exports.TreeIt = TreeIt;
//# sourceMappingURL=TreeIt.js.map