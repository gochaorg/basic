"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeIt_1 = require("../common/TreeIt");
class AExpression {
    get treeSize() {
        if (this.treeSizeValue !== undefined)
            return this.treeSizeValue;
        this.treeSizeValue = this.treeList.length;
        return this.treeSizeValue;
    }
    get treeList() {
        return TreeIt_1.TreeIt.list(this, (n) => n.children);
    }
    get treeLexList() {
        const arr = [];
        this.treeList.forEach(exp => {
            exp.value.lexems.forEach(lx => arr.push(lx));
        });
        return arr;
    }
    get leftTreeLex() {
        const lxs = this.treeLexList;
        if (lxs.length < 1)
            return undefined;
        if (lxs.length == 1)
            return lxs[0];
        return lxs.reduce((a, b) => a.begin > b.begin ? b : a);
    }
    get rightTreeLex() {
        const lxs = this.treeLexList;
        if (lxs.length < 1)
            return undefined;
        if (lxs.length == 1)
            return lxs[0];
        return lxs.reduce((a, b) => a.begin > b.begin ? a : b);
    }
}
exports.AExpression = AExpression;
/**
 * Константное значение (Литерал - строка/число/и т.д...)
 */
class LiteralExpression extends AExpression {
    constructor(lex, value) {
        super();
        this.lex = lex;
        this.value = value;
        this.lexems = [lex];
        this.children = [];
        this.kind = 'Literal';
    }
}
exports.LiteralExpression = LiteralExpression;
/**
 * Ссылка на переменную
 */
class VarRefExpression extends AExpression {
    constructor(lex) {
        super();
        this.id = lex;
        this.lexems = [lex];
        this.children = [];
        this.kind = 'VarRef';
    }
    get varname() { return this.id.id; }
}
exports.VarRefExpression = VarRefExpression;
/**
 * Ссылка на значение массива
 */
class VarArrIndexRef extends VarRefExpression {
    constructor(lex, indexes) {
        super(lex);
        this.indexes = indexes;
    }
}
exports.VarArrIndexRef = VarArrIndexRef;
/**
 * Бинарная операция
 */
class BinaryOpExpression extends AExpression {
    constructor(op, left, right) {
        super();
        this.operator = op;
        this.left = left;
        this.right = right;
        this.lexems = [op];
        this.children = [left, right];
        this.kind = 'BinaryOperator';
    }
}
exports.BinaryOpExpression = BinaryOpExpression;
/**
 * Унраная операция
 */
class UnaryOpExpression extends AExpression {
    constructor(op, base) {
        super();
        this.operator = op;
        this.base = base;
        this.lexems = [op];
        this.children = [base];
        this.kind = 'UnaryOperator';
    }
}
exports.UnaryOpExpression = UnaryOpExpression;
//# sourceMappingURL=OperatorExp.js.map