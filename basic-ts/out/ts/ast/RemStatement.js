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
var ARemStatement = /** @class */ (function () {
    function ARemStatement(begin, end, rem) {
        this.begin = begin;
        this.end = end;
        this.rem = rem;
        this.kind = 'Rem';
    }
    return ARemStatement;
}());
exports.ARemStatement = ARemStatement;
var SRemStatement = /** @class */ (function (_super) {
    __extends(SRemStatement, _super);
    function SRemStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SRemStatement;
}(ARemStatement));
exports.SRemStatement = SRemStatement;
var IRemStatement = /** @class */ (function (_super) {
    __extends(IRemStatement, _super);
    function IRemStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return IRemStatement;
}(ARemStatement));
exports.IRemStatement = IRemStatement;
//# sourceMappingURL=RemStatement.js.map