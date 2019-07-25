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
var GoSubStatement = /** @class */ (function (_super) {
    __extends(GoSubStatement, _super);
    function GoSubStatement(begin, end, line) {
        var _this = _super.call(this) || this;
        _this.begin = begin;
        _this.end = end;
        _this.gotoLine = line;
        _this.kind = 'Gosub';
        return _this;
    }
    return GoSubStatement;
}(Statement_1.Statement));
exports.GoSubStatement = GoSubStatement;
//# sourceMappingURL=GoSub copy.js.map