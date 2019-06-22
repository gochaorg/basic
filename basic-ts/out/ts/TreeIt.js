"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Шаг очередной итерации
 */
var TreeStep = /** @class */ (function () {
    /**
     * Конструктор
     * @param value Значение узла дерева
     * @param parent Ссылка на родительский элемент дерева
     */
    function TreeStep(value, parent) {
        this.value = value;
        this.parent = parent;
    }
    /**
     * Создание дочернего пути/шага при обходе дерева
     * @param value дочернее значение узла
     */
    TreeStep.prototype.follow = function (value) {
        return new TreeStep(value, this);
    };
    Object.defineProperty(TreeStep.prototype, "path", {
        /**
         * Возвращает путь значений в дереве
         */
        get: function () {
            var res = [];
            var ts = this;
            while (ts != undefined && ts != null) {
                res.push(ts.value);
                ts = ts.parent;
            }
            res.reverse();
            return res;
        },
        enumerable: true,
        configurable: true
    });
    return TreeStep;
}());
exports.TreeStep = TreeStep;
/**
 * Итератор для обхода дерева
 */
var TreeIt = /** @class */ (function () {
    /**
     * Конструктор
     * @param start начальный узел дерева
     * @param follow функция перехода к дочерним узлам
     */
    function TreeIt(start, follow) {
        this.follow = follow;
        this.current = [new TreeStep(start)];
    }
    /**
     * Проверяет наличие дочернего узла
     */
    TreeIt.prototype.hasNext = function () {
        return this.current.length > 0;
    };
    /**
     * Переход к следующему узлу в дереве
     */
    TreeIt.prototype.fetch = function () {
        var _this = this;
        if (this.current.length <= 0)
            return undefined;
        var res = this.current.splice(0, 1);
        //let res:T|undefined = this.current.pop()
        if (res != undefined) {
            res.forEach(function (r) {
                _this.follow(r.value).forEach(function (n) { return _this.current.push(r.follow(n)); });
            });
        }
        if (res != undefined) {
            return res.length > 0 ? res[0] : undefined;
        }
        return undefined;
    };
    /**
     * Обход узлов дерева
     * @param start начальный узел дерева
     * @param follow функция перехода к дочерним узлам
     * @param consumer функция - визер узлов дерева
     */
    TreeIt.each = function (start, follow, consumer) {
        if (start == null || start == undefined)
            throw new Error("illegal arg start");
        if (follow == null || follow == undefined)
            throw new Error("illegal arg follow");
        if (consumer == null || consumer == undefined)
            throw new Error("illegal arg consumer");
        var titer = new TreeIt(start, follow);
        while (titer.hasNext()) {
            var f = titer.fetch();
            if (f) {
                consumer(f);
            }
        }
    };
    /**
     * Разворчивание дерева в список
     * @param start начальный узел
     * @param follow функция перехода к дочерним узлам
     */
    TreeIt.list = function (start, follow) {
        if (start == null || start == undefined)
            throw new Error("illegal arg start");
        if (follow == null || follow == undefined)
            throw new Error("illegal arg follow");
        var arr = [];
        TreeIt.each(start, follow, function (n) { arr.push(n); });
        return arr;
    };
    return TreeIt;
}());
exports.TreeIt = TreeIt;
//# sourceMappingURL=TreeIt.js.map