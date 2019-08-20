"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Работа с командной строкой
 */
exports.cmdline = {
    args: [...process.argv],
    shift: () => { return exports.cmdline.args.shift(); },
    match: (ptrn, cycle = true) => {
        const parse = () => {
            const arg = exports.cmdline.shift();
            if (arg) {
                const mptr = ptrn[arg];
                if (mptr) {
                    if (mptr.int) {
                        const arg2 = exports.cmdline.shift();
                        if (arg2) {
                            const n = parseInt(arg2, 10);
                            if (n !== NaN) {
                                mptr.int(n);
                            }
                        }
                    }
                    if (mptr.num) {
                        const arg2 = exports.cmdline.shift();
                        if (arg2) {
                            const n = parseFloat(arg2);
                            if (n !== NaN) {
                                mptr.num(n);
                            }
                        }
                    }
                    if (mptr.str) {
                        const arg2 = exports.cmdline.shift();
                        if (arg2) {
                            mptr.str(arg2);
                        }
                    }
                }
            }
        };
        if (cycle) {
            while (exports.cmdline.args.length > 0) {
                parse();
            }
        }
        else {
            parse();
        }
    }
};
//# sourceMappingURL=CmdLine.js.map