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
var AStatements = /** @class */ (function () {
    function AStatements(begin, end, statements) {
        this.begin = begin;
        this.end = end;
        this.statements = statements;
    }
    return AStatements;
}());
exports.AStatements = AStatements;
var SStatements = /** @class */ (function (_super) {
    __extends(SStatements, _super);
    function SStatements() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SStatements;
}(AStatements));
exports.SStatements = SStatements;
var IStatements = /** @class */ (function (_super) {
    __extends(IStatements, _super);
    function IStatements() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return IStatements;
}(AStatements));
exports.IStatements = IStatements;
//# sourceMappingURL=Statements.js.map