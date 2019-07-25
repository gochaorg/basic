"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConsolePrinter = /** @class */ (function () {
    function ConsolePrinter() {
        this.args = [];
    }
    ConsolePrinter.prototype.print = function (value) {
        this.args.push(value);
    };
    ConsolePrinter.prototype.println = function () {
        console.log(this.args);
        this.args = [];
    };
    return ConsolePrinter;
}());
exports.ConsolePrinter = ConsolePrinter;
var CustomPrinter = /** @class */ (function () {
    function CustomPrinter(printfn, printlnfn) {
        this.printfn = printfn;
        this.printlnfn = printlnfn;
    }
    CustomPrinter.prototype.print = function (value) {
        this.printfn(value);
    };
    CustomPrinter.prototype.println = function () {
        this.printlnfn();
    };
    return CustomPrinter;
}());
exports.CustomPrinter = CustomPrinter;
var SingleFnPrinter = /** @class */ (function () {
    function SingleFnPrinter(printfn) {
        this.args = [];
        this.printfn = printfn;
    }
    SingleFnPrinter.prototype.print = function (value) {
        this.args.push(value);
    };
    SingleFnPrinter.prototype.println = function () {
        this.printfn(this.args);
        this.args = [];
    };
    return SingleFnPrinter;
}());
exports.SingleFnPrinter = SingleFnPrinter;
exports.printers = {
    console: new ConsolePrinter(),
    custom: function (printfn, printlnfn) {
        return new CustomPrinter(printfn, printlnfn);
    },
    sprint: function (printfn) {
        return new SingleFnPrinter(printfn);
    }
};
//# sourceMappingURL=Print.js.map