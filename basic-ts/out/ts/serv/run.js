"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Conf_1 = require("./Conf");
// конфигурация
var conf = new Conf_1.Conf();
/** Обработка параметров командной строки */
function processCmdLine() {
    var cmdline = process.argv.slice();
    while (cmdline.length > 0) {
        var arg = cmdline.shift();
        if (arg == '-root') {
            var rootDir = cmdline.shift();
            if (rootDir) {
                conf.root = rootDir;
            }
        }
        else if (arg == '-port') {
            var portnumStr = cmdline.shift();
            if (portnumStr) {
                var portnum = parseInt(portnumStr, 10);
                if (portnum !== NaN) {
                    conf.port = portnum;
                }
            }
        }
    }
}
processCmdLine();
// const jsnText = fs.readFileSync('src/test/serv/conf.json',{encoding:'utf-8'})
// const jsnConf = JSON.parse(jsnText)
// console.log(jsnConf)
//# sourceMappingURL=run.js.map