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
var Statement_1 = require("./Statement");
var IfStatement = /** @class */ (function (_super) {
    __extends(IfStatement, _super);
    function IfStatement(begin, end, boolExp, trueStatement, falseStatement) {
        var _this = _super.call(this) || this;
        _this.kind = 'If';
        _this.begin = begin;
        _this.end = end;
        _this.boolExp = boolExp;
        _this.trueStatement = trueStatement;
        _this.falseStatement = falseStatement;
        return _this;
    }
    return IfStatement;
}(Statement_1.Statement));
exports.IfStatement = IfStatement;
//# sourceMappingURL=IfStatement.js.map