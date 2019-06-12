"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Шаг очередной итерации
 */
var TreeStep = /** @class */ (function () {
    function TreeStep(value, parent) {
        this.value = value;
        this.parent = parent;
    }
    TreeStep.prototype.follow = function (value) {
        return new TreeStep(value, this);
    };
    Object.defineProperty(TreeStep.prototype, "path", {
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
 * Обход дерева
 */
var TreeIt = /** @class */ (function () {
    function TreeIt(start, follow) {
        this.follow = follow;
        this.current = [new TreeStep(start)];
    }
    TreeIt.prototype.hasNext = function () {
        return this.current.length > 0;
    };
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