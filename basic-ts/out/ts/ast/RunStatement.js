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
var ARunStatement = /** @class */ (function () {
    function ARunStatement(begin, end, line) {
        this.begin = begin;
        this.end = end;
        this.line = line;
        this.kind = 'Run';
    }
    return ARunStatement;
}());
exports.ARunStatement = ARunStatement;
var IRunStatement = /** @class */ (function (_super) {
    __extends(IRunStatement, _super);
    function IRunStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return IRunStatement;
}(ARunStatement));
exports.IRunStatement = IRunStatement;
var SRunStatement = /** @class */ (function (_super) {
    __extends(SRunStatement, _super);
    function SRunStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SRunStatement;
}(ARunStatement));
exports.SRunStatement = SRunStatement;
//# sourceMappingURL=RunStatement.js.map