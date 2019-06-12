"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ALetStatement = /** @class */ (function () {
    function ALetStatement(begin, end, variable, value) {
        this.begin = begin;
        this.end = end;
        this.variable = variable;
        this.value = value;
        this.kind = 'Let';
    }
    return ALetStatement;
}());
exports.ALetStatement = ALetStatement;
var ILetStatement = /** @class */ (function (_super) {
    __extends(ILetStatement, _super);
    function ILetStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ILetStatement;
}(ALetStatement));
exports.ILetStatement = ILetStatement;
var SLetStatement = /** @class */ (function (_super) {
    __extends(SLetStatement, _super);
    function SLetStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SLetStatement;
}(ALetStatement));
exports.SLetStatement = SLetStatement;
//# sourceMappingURL=LetStatement.js.map