"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var process = require("process");
var fs_1 = __importDefault(require("fs"));
var SourceUnit_1 = require("./vm/SourceUnit");
var BasicVm_1 = require("./vm/BasicVm");
var Args = /** @class */ (function () {
    function Args() {
        this.commands = [];
    }
    return Args;
}());
/**
 * Обработка параметров командной строки
 * @param args параметры командной строки
 */
function processArgs(commandLineArgs) {
    var res = new Args();
    var stop = function (r, a) { return stop; };
    var parseArgs = function (q, args) {
        if (/(\-|\-\-|\/)(\?|help)/.test(args[0])) {
            args.shift();
            q.commands.push(function () { showHelp(); });
            return init;
        }
        if (args.length > 1 && (args[0] == '-r' || args[0] == '--run')) {
            args.shift();
            var filename_1 = args.shift();
            if (filename_1) {
                q.commands.push(function () { runFile(filename_1); });
            }
        }
        args.shift();
        return parseArgs;
    };
    var init = function (q, args) {
        if (args.length < 1)
            return stop;
        if (args.length == 1) {
            var tryFilename_1 = args[0];
            var tryFileSt = fs_1.default.statSync(tryFilename_1);
            if (tryFileSt.isFile()) {
                args.shift();
                q.commands.push(function () {
                    runFile(tryFilename_1);
                });
                return stop;
            }
        }
        return parseArgs;
    };
    var argz = commandLineArgs.slice();
    var parse = init;
    while (argz.length > 0) {
        var r = parse(res, argz);
        if (r == stop) {
            break;
        }
        parse = r;
    }
    return res;
}
/**
 * Выполнить файл
 * @param filename имя файла
 */
function runFile(filename) {
    //console.log(`run file ${filename}`)
    var basicSrc = fs_1.default.readFileSync(filename, { encoding: 'utf-8' });
    var su = new SourceUnit_1.SourceUnit().parse(basicSrc);
    var vm = new BasicVm_1.BasicVm(su);
    vm.ip = 0;
    while (vm.hasNext()) {
        vm.next();
    }
}
/**
 * Отобразить справку
 */
function showHelp() {
    console.log("show help");
}
processArgs(process.argv).commands.forEach(function (a) { return a(); });
//# sourceMappingURL=tsbasic.js.map