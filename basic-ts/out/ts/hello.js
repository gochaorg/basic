"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var wu = __importStar(require("./WidgetUtil"));
var SourceUnit_1 = require("./vm/SourceUnit");
var AstToBasic_1 = require("./ast/AstToBasic");
var Memo_1 = require("./vm/Memo");
var BasicVm_1 = require("./vm/BasicVm");
var GWBASICApp = /** @class */ (function () {
    function GWBASICApp() {
        //#endregion
        //#region sourceUnit
        this.suValue = new SourceUnit_1.SourceUnit;
        this.renderedSourceLines = {};
        //#endregion
        //#region memo
        this.memoInstance = new Memo_1.Memo();
        this.uiVars = {};
    }
    Object.defineProperty(GWBASICApp.prototype, "ui", {
        //#region ui
        get: function () {
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
                get memoDump() {
                    return document.querySelector('#memoDump');
                },
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GWBASICApp.prototype, "sourceUnit", {
        get: function () { return this.suValue; },
        set: function (su) {
            var _this = this;
            this.suValue = su;
            setTimeout(function () { _this.renderSourceUnit(); }, 1);
        },
        enumerable: true,
        configurable: true
    });
    GWBASICApp.prototype.parseBasic = function (command) {
        try {
            this.sourceUnit = this.sourceUnit.parse(command);
            this.rebuildVm();
            if (this.ui.parseError) {
                this.ui.parseError.innerHTML = '';
                this.ui.parseError.style.display = 'none';
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
    };
    GWBASICApp.prototype.renderSourceUnit = function () {
        var _this = this;
        this.renderedSourceLines = {};
        if (this.ui.sourceUnit) {
            var ui = this.ui.sourceUnit;
            ui.innerHTML = '';
            var _loop_1 = function (line) {
                var ldiv = wu.
                    div({ class: "sourceLine l" + line.line + " li" + line.index }).
                    append(ui).el;
                wu.span({ class: "lineNum" }).text(line.line.toString()).append(ldiv);
                wu.span({ class: 'code' }).
                    text(AstToBasic_1.astToBasic(line.statement, {
                    sourceLineNumber: false
                })).
                    append(ldiv);
                wu.a({ class: 'goto', href: '#' }).text('goto').append(ldiv).onclick(function (e) {
                    _this.goto(line.index);
                });
                this_1.renderedSourceLines[line.index] = ldiv;
                if (this_1.vm.ip == line.index) {
                    ldiv.classList.add('active');
                }
            };
            var this_1 = this;
            for (var _i = 0, _a = this.sourceUnit.lines; _i < _a.length; _i++) {
                var line = _a[_i];
                _loop_1(line);
            }
        }
    };
    Object.defineProperty(GWBASICApp.prototype, "memo", {
        get: function () {
            var _this = this;
            if (this.memoInstance)
                return this.memoInstance;
            this.memoInstance = new Memo_1.Memo();
            setTimeout(function () { _this.renderMemo(); }, 1);
            return this.memoInstance;
        },
        set: function (mem) {
            var _this = this;
            this.memoInstance = mem;
            setTimeout(function () { _this.renderMemo(); }, 1);
        },
        enumerable: true,
        configurable: true
    });
    GWBASICApp.prototype.renderMemo = function () {
        if (this.ui.memoDump) {
            this.ui.memoDump.innerHTML = '';
            for (var _i = 0, _a = this.memo.varnames; _i < _a.length; _i++) {
                var varname = _a[_i];
                var varvalue = this.memo.read(varname);
            }
        }
    };
    GWBASICApp.prototype.renderMemoVar = function (varname, oldvalue, newvalue) {
        if (newvalue != undefined) {
            var ui = this.uiVars[varname];
            if (ui) {
                ui.value.innerText = newvalue;
            }
            else {
                ui = {
                    container: wu.div({ class: 'var' }).el,
                    name: wu.span({ class: 'name' }).text(varname).el,
                    value: wu.span({ class: 'value' }).text(newvalue).el
                };
                ui.container.appendChild(ui.name);
                ui.container.appendChild(ui.value);
                this.uiVars[varname] = ui;
                if (this.ui.memoDump) {
                    this.ui.memoDump.appendChild(ui.container);
                }
            }
        }
    };
    Object.defineProperty(GWBASICApp.prototype, "vm", {
        get: function () {
            var _this = this;
            if (this.vmInstance)
                return this.vmInstance;
            this.vmInstance = new BasicVm_1.BasicVm(this.sourceUnit, this.memo);
            setTimeout(function () { _this.renderVm(); }, 1);
            return this.vmInstance;
        },
        set: function (v) {
            var _this = this;
            this.vmInstance = v;
            setTimeout(function () { _this.renderVm(); }, 1);
        },
        enumerable: true,
        configurable: true
    });
    GWBASICApp.prototype.rebuildVm = function () {
        var _this = this;
        this.vmInstance = new BasicVm_1.BasicVm(this.sourceUnit, this.memo);
        setTimeout(function () { _this.renderVm(); }, 1);
        return this.vmInstance;
    };
    GWBASICApp.prototype.renderVm = function () {
        this.renderIp();
    };
    //#endregion
    GWBASICApp.prototype.goto = function (ip) {
        var _this = this;
        console.log("goto ip=" + ip);
        this.vm.ip = ip;
        setTimeout(function () { _this.renderIp(); }, 1);
    };
    GWBASICApp.prototype.renderIp = function () {
        for (var i = 0; i < Object.getOwnPropertyNames(this.renderedSourceLines).length; i++) {
            this.renderedSourceLines[i].classList.remove('active');
        }
        var lineDiv = this.renderedSourceLines[this.vm.ip];
        if (lineDiv) {
            lineDiv.classList.add('active');
        }
    };
    GWBASICApp.prototype.goNext = function () {
        console.log('goNext() clicked');
        if (this.vm.hasNext()) {
            this.vm.next();
            this.renderIp();
        }
    };
    GWBASICApp.prototype.init = function () {
        var _this = this;
        if (this.ui.parseSourceCode && this.ui.sourceCode) {
            var btn = this.ui.parseSourceCode;
            var txt_1 = this.ui.sourceCode;
            btn.addEventListener('click', function (e) { return _this.parseBasic(txt_1.value); });
            txt_1.addEventListener('keydown', function (e) {
                if (e.keyCode == 13 && e.ctrlKey) {
                    _this.parseBasic(txt_1.value);
                }
            });
        }
        if (this.ui.goNext) {
            this.ui.goNext.addEventListener('click', function (e) { return _this.goNext(); });
        }
        this.memo.listeners.push(function (varname, from, to) {
            console.log('handled var changes ', varname, from, to);
            _this.renderMemoVar(varname, from, to);
        });
    };
    return GWBASICApp;
}());
new GWBASICApp().init();
//# sourceMappingURL=hello.js.map