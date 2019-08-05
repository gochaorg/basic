"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConsolePrinter {
    constructor() {
        this.args = [];
        this.prefix = "";
    }
    clone() {
        const c = new ConsolePrinter();
        c.args = this.args;
        c.prefix = this.prefix;
        return c;
    }
    configure(x) {
        x(this);
        return this;
    }
    print(value) {
        this.args.push(value);
    }
    println() {
        console.log(this.prefix + this.args.map(x => "" + x).join(""));
        this.args = [];
    }
}
exports.ConsolePrinter = ConsolePrinter;
class CustomPrinter {
    constructor(printfn, printlnfn) {
        this.printfn = printfn;
        this.printlnfn = printlnfn;
    }
    clone() {
        return new CustomPrinter(this.printfn, this.printlnfn);
    }
    print(value) {
        this.printfn(value);
    }
    println() {
        this.printlnfn();
    }
}
exports.CustomPrinter = CustomPrinter;
class SingleFnPrinter {
    constructor(printfn) {
        this.args = [];
        this.printfn = printfn;
    }
    clone() {
        const c = new SingleFnPrinter(this.printfn);
        this.args.forEach(x => c.args.push(x));
        return c;
    }
    print(value) {
        this.args.push(value);
    }
    println() {
        this.printfn(this.args);
        this.args = [];
    }
}
exports.SingleFnPrinter = SingleFnPrinter;
exports.printers = {
    console: new ConsolePrinter(),
    custom(printfn, printlnfn) {
        return new CustomPrinter(printfn, printlnfn);
    },
    sprint(printfn) {
        return new SingleFnPrinter(printfn);
    }
};
//# sourceMappingURL=Printer.js.map