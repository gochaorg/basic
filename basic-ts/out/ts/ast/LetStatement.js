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
var LetStatement = /** @class */ (function (_super) {
    __extends(LetStatement, _super);
    function LetStatement(begin, end, variable, value) {
        var _this = _super.call(this) || this;
        _this.begin = begin;
        _this.end = end;
        _this.variable = variable;
        _this.value = value;
        _this.kind = 'Let';
        return _this;
    }
    return LetStatement;
}(Statement_1.Statement));
exports.LetStatement = LetStatement;
//# sourceMappingURL=LetStatement.js.map