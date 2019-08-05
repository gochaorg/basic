"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const wu = __importStar(require("./ui/WidgetUtil"));
const SourceUnit_1 = require("./vm/SourceUnit");
const AstToBasic_1 = require("./ast/AstToBasic");
const Memo_1 = require("./vm/Memo");
const BasicVm_1 = require("./vm/BasicVm");
const Printer_1 = require("./vm/Printer");
const tsLang = __importStar(require("./stdlib/TsLang"));
const ExtFun_1 = require("./vm/ExtFun");
class GWBASICApp {
    constructor() {
        //#endregion
        //#region sourceUnit
        this.suValue = new SourceUnit_1.SourceUnit;
        this.renderedSourceLines = {};
        this.uiVars = {};
    }
    //#region ui
    get ui() {
        return {
            get sourceUnit() {
                return document.querySelector('#sourceUnit');
            },
            get sourceCode() {
                return document.querySelector('#sourceCode');
            },
            get parseSourceCode() {
                return document.querySelector('#parseSourceCode');
            },
            get parseError() {
                return document.querySelector('#parseError');
            },
            get goNext() {
                return document.querySelector('#goNext');
            },
            get memoDump() { return document.querySelector('#memoDump'); },
            get helpContent() { return document.querySelector('#helpContent'); },
            get showHelp() { return document.querySelector('#showHelp'); },
            get closeHelp() { return document.querySelector('#closeHelp'); },
            get output() { return document.querySelector('#output'); },
            get clearOutput() {
                return document.querySelector('#clearOutput');
            }
        };
    }
    get sourceUnit() { return this.suValue; }
    set sourceUnit(su) {
        this.suValue = su;
        setTimeout(() => { this.renderSourceUnit(); }, 1);
    }
    parseBasic(command) {
        try {
            let imStmts = [];
            this.sourceUnit = this.sourceUnit.parse(command, {
                immediateStatements(statements) {
                    imStmts = statements;
                }
            });
            this.rebuildVm();
            if (this.ui.parseError) {
                this.ui.parseError.innerHTML = '';
                this.ui.parseError.style.display = 'none';
            }
            for (let imSt of imStmts) {
                this.vm.evalStatement(imSt);
            }
        }
        catch (err) {
            if (this.ui.parseError) {
                this.ui.parseError.textContent = err.toString();
                this.ui.parseError.style.display = '';
                console.log('log parse error:', err.toString());
            }
            else {
                console.log('log parse error:', err.toString());
            }
        }
    }
    renderSourceUnit() {
        this.renderedSourceLines = {};
        if (this.ui.sourceUnit) {
            const ui = this.ui.sourceUnit;
            ui.innerHTML = '';
            for (let line of this.sourceUnit.lines) {
                const ldiv = wu.
                    div({ class: `sourceLine l${line.line} li${line.index}` }).
                    append(ui).el;
                wu.span({ class: `lineNum` }).text(line.line.toString()).append(ldiv);
                wu.span({ class: 'code' }).
                    text(AstToBasic_1.astToBasic(line.statement, {
                    sourceLineNumber: false
                })).
                    append(ldiv);
                wu.a({ class: 'goto', href: '#' }).text('goto').append(ldiv).onclick(e => {
                    this.goto(line.index);
                });
                this.renderedSourceLines[line.index] = ldiv;
                if (this.vm.ip == line.index) {
                    ldiv.classList.add('active');
                }
            }
        }
    }
    get memo() {
        if (this.memoInstance) {
            return this.memoInstance;
        }
        this.memoInstance = new Memo_1.Memo();
        this.registerLibs();
        setTimeout(() => { this.renderMemo(); }, 1);
        return this.memoInstance;
    }
    set memo(mem) {
        this.memoInstance = mem;
        this.registerLibs();
        setTimeout(() => { this.renderMemo(); }, 1);
    }
    registerLibs() {
        if (this.memoInstance) {
            tsLang.register(this.memoInstance);
        }
    }
    renderMemo() {
        Object.keys(this.uiVars).forEach(n => { delete this.uiVars[n]; });
        if (this.ui.memoDump) {
            this.ui.memoDump.innerHTML = '';
            for (const varname of this.memo.varnames) {
                const varvalue = this.memo.read(varname);
                const ui = this.renderVarValue(varname, varvalue);
                ui.container.appendChild(ui.name);
                ui.container.appendChild(ui.value);
                this.uiVars[varname] = ui;
                this.ui.memoDump.appendChild(ui.container);
            }
        }
    }
    renderMemoVar(varname, oldvalue, newvalue) {
        if (newvalue != undefined) {
            let ui = this.uiVars[varname];
            if (ui) {
                ui.value.innerText = newvalue;
            }
            else {
                ui = this.renderVarValue(varname, newvalue);
                ui.container.appendChild(ui.name);
                ui.container.appendChild(ui.value);
                this.uiVars[varname] = ui;
                if (this.ui.memoDump) {
                    this.ui.memoDump.appendChild(ui.container);
                }
            }
        }
        else {
            let ui = this.uiVars[varname];
            if (this.ui.memoDump && ui) {
                this.ui.memoDump.removeChild(ui.container);
                delete this.uiVars[varname];
            }
        }
    }
    renderVarValue(varname, varvalue) {
        let clss = "";
        let renderFn = (value) => {
            return wu.span({ class: 'value' + clss }).text("Function").el;
        };
        let render = (value) => {
            return wu.span({ class: 'value' + clss }).text(value).el;
        };
        if (varvalue instanceof ExtFun_1.Fun) {
            clss += " Fun";
            render = renderFn;
        }
        return {
            container: wu.div({ class: 'var' + clss }).el,
            name: wu.span({ class: 'name' + clss }).text(varname).el,
            value: render(varvalue)
        };
    }
    //#endregion
    //#region vm
    get vmPrinter() {
        if (this.ui.output) {
            return Printer_1.printers.sprint((args) => {
                let txt = args.map(x => "" + x).join("");
                this.ui.output.innerHTML += wu.toHtml(txt) + "<br/>";
            });
        }
        else {
            return Printer_1.printers.console.clone().configure(c => { c.prefix = "BASIC> "; });
        }
    }
    get vm() {
        if (this.vmInstance)
            return this.vmInstance;
        this.vmInstance = new BasicVm_1.BasicVm(this.sourceUnit, this.memo);
        this.vmInstance.printer = this.vmPrinter;
        setTimeout(() => { this.renderVm(); }, 1);
        return this.vmInstance;
    }
    set vm(v) {
        this.vmInstance = v;
        setTimeout(() => { this.renderVm(); }, 1);
    }
    rebuildVm() {
        this.vmInstance = new BasicVm_1.BasicVm(this.sourceUnit, this.memo);
        this.vmInstance.printer = this.vmPrinter;
        setTimeout(() => { this.renderVm(); }, 1);
        return this.vmInstance;
    }
    renderVm() {
        this.renderIp();
    }
    //#endregion
    //#region goto/renderIp
    goto(ip) {
        console.log(`goto ip=${ip}`);
        this.vm.ip = ip;
        setTimeout(() => { this.renderIp(); }, 1);
    }
    renderIp() {
        for (let i = 0; i < Object.getOwnPropertyNames(this.renderedSourceLines).length; i++) {
            this.renderedSourceLines[i].classList.remove('active');
        }
        const lineDiv = this.renderedSourceLines[this.vm.ip];
        if (lineDiv) {
            lineDiv.classList.add('active');
        }
    }
    //#endregion
    //#region goNext
    goNext() {
        console.log('goNext() clicked');
        if (this.vm.hasNext()) {
            this.vm.next();
            this.renderIp();
        }
    }
    //#endregion
    init() {
        if (this.ui.parseSourceCode && this.ui.sourceCode) {
            const btn = this.ui.parseSourceCode;
            const txt = this.ui.sourceCode;
            btn.addEventListener('click', e => this.parseBasic(txt.value));
            txt.addEventListener('keydown', (e) => {
                if (e.keyCode == 13 && e.ctrlKey) {
                    this.parseBasic(txt.value);
                }
                else if (e.code == 'KeyN' && e.altKey) {
                    this.goNext();
                }
                else {
                    //console.log('keydown',e)
                }
            });
        }
        if (this.ui.goNext) {
            this.ui.goNext.addEventListener('click', e => this.goNext());
        }
        this.memo.listeners.push((varname, from, to) => {
            console.log('handled var changes ', varname, from, to);
            this.renderMemoVar(varname, from, to);
        });
        if (this.ui.showHelp) {
            this.ui.showHelp.addEventListener('click', e => {
                if (this.ui.helpContent) {
                    this.ui.helpContent.classList.add('active');
                    console.log("clicked 1");
                }
            });
        }
        if (this.ui.closeHelp) {
            this.ui.closeHelp.addEventListener('click', e => {
                if (this.ui.helpContent) {
                    this.ui.helpContent.classList.remove('active');
                    console.log("clicked 2");
                }
            });
        }
        if (this.ui.clearOutput) {
            this.ui.clearOutput.addEventListener('click', e => {
                if (this.ui.output) {
                    this.ui.output.innerHTML = "";
                }
            });
        }
    }
}
new GWBASICApp().init();
//# sourceMappingURL=hello.js.map