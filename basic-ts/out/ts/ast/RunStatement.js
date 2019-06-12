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
var ARunStatement = /** @class */ (function (_super) {
    __extends(ARunStatement, _super);
    function ARunStatement(begin, end, line) {
        var _this = _super.call(this) || this;
        _this.begin = begin;
        _this.end = end;
        _this.line = line;
        _this.kind = 'Run';
        return _this;
    }
    return ARunStatement;
}(Statement_1.Statement));
exports.ARunStatement = ARunStatement;
//# sourceMappingURL=RunStatement.js.map