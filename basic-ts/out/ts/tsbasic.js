"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var process = require("process");
var fs_1 = __importDefault(require("fs"));
var SourceUnit_1 = require("./vm/SourceUnit");
var BasicVm_1 = require("./vm/BasicVm");
/**
 * Аргументы командной строки
 */
var Args = /** @class */ (function () {
    function Args() {
        /**
         * Последовательно выполняемые команды
         */
        this.commands = [];
        /**
         * Кодировка файла
         */
        this.encoding = 'utf-8';
    }
    return Args;
}());
/**
 * Обработка параметров командной строки
 * @param args параметры командной строки
 */
function processArgs(commandLineArgs) {
    var res = new Args();
    var argz = commandLineArgs.slice();
    if (argz.length > 0) {
        res.nodeExe = argz.shift();
    }
    if (argz.length > 0) {
        res.startupJs = argz.shift();
    }
    if (argz.length == 0) {
        res.commands.push(function (a) { showHelp(a); });
    }
    var stop = function (r, a) { return stop; };
    var parseArgs = function (q, args) {
        if (/(\-|\-\-|\/)(\?|help)/.test(args[0])) {
            args.shift();
            q.commands.push(function (a) { showHelp(a); });
            return init;
        }
        if (args.length > 1 && (args[0] == '-r' || args[0] == '--run')) {
            args.shift();
            var filename_1 = args.shift();
            if (filename_1) {
                q.commands.push(function () { runFile(filename_1, q.encoding); });
            }
            return parseArgs;
        }
        if (args.length > 1 && args[0] == '--ast2json') {
            args.shift();
            var filename_2 = args.shift();
            if (filename_2) {
                var outfile_1 = undefined;
                if (args.length > 1 && args[0] == '--out') {
                    args.shift();
                    outfile_1 = args.shift();
                }
                q.commands.push(function () {
                    ast2json(filename_2, q.encoding, outfile_1);
                });
            }
            return parseArgs;
        }
        if (args.length > 1 && args[0] == '--encoding') {
            args.shift();
            q.encoding = args.shift();
            return parseArgs;
        }
        args.shift();
        return parseArgs;
    };
    var init = function (q, args) {
        if (args.length < 1) {
            return stop;
        }
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
 * @param encoding кодировка файла
 */
function runFile(filename, encoding) {
    if (encoding === void 0) { encoding = 'utf-8'; }
    //console.log(`run file ${filename}`)
    var basicSrc = fs_1.default.readFileSync(filename, { encoding: encoding });
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
function showHelp(a) {
    console.log("tsbasic command line syntax:");
    console.log("============================");
    console.log("");
    console.log("common syntax");
    console.log("-------------");
    console.log("    tsbasic ::= `tsbasic` (runFile|keyValues)");
    console.log("    runFile ::= source_file_name");
    console.log("    keyValues ::= { runFileKey ");
    console.log("                  | ast2json");
    console.log("                  | encoding");
    console.log("                  }");
    console.log("    runFileKey ::= (`-r` | `--run` ) source_file_name");
    console.log("    ast2json   ::= `--ast2json` source_file_name [ `--out` output_file_name ]");
    console.log("    encoding   ::= `--encoding` encoding");
    console.log("");
    console.log("run file");
    console.log("--------");
    console.log("    tsbasic basic_file.bas");
    console.log("    tsbasic -r basic_file.bas");
    console.log("    tsbasic --run basic_file.bas");
    console.log("");
    console.log("ast 2 json");
    console.log("----------");
    console.log("    tsbasic --ast2json basic_file.bas --out ast.json");
}
/**
 * Парсинг файла и вывод его дерева AST в файл
 * @param filename basic файл
 * @param encoding кодировка файла
 * @param outputFilename файл в который производиться вывод
 */
function ast2json(filename, encoding, outputFilename) {
    if (encoding === void 0) { encoding = 'utf-8'; }
    var basicSrc = fs_1.default.readFileSync(filename, { encoding: encoding });
    var su = new SourceUnit_1.SourceUnit().parse(basicSrc);
    var jsn = JSON.stringify(su, undefined, 2);
    if (outputFilename) {
        fs_1.default.writeFileSync(outputFilename, jsn, { encoding: encoding });
    }
    else {
        console.log(jsn);
    }
}
var tsArgs = processArgs(process.argv);
tsArgs.commands.forEach(function (a) { return a(tsArgs); });
//# sourceMappingURL=tsbasic.js.map