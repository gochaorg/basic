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
var GWBASICApp = /** @class */ (function () {
    function GWBASICApp() {
        this.suValue = new SourceUnit_1.SourceUnit;
        this.renderedSourceLines = {};
    }
    Object.defineProperty(GWBASICApp.prototype, "ui", {
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
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GWBASICApp.prototype, "sourceUnit", {
        get: function () { return this.suValue; },
        set: function (su) {
            this.suValue = su;
            this.renderSourceUnit();
        },
        enumerable: true,
        configurable: true
    });
    GWBASICApp.prototype.parseBasic = function (command) {
        try {
            this.sourceUnit = this.sourceUnit.parse(command);
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
        this.renderedSourceLines = {};
        if (this.ui.sourceUnit) {
            var ui = this.ui.sourceUnit;
            ui.innerHTML = '';
            for (var _i = 0, _a = this.sourceUnit.lines; _i < _a.length; _i++) {
                var line = _a[_i];
                var ldiv = wu.
                    div({ class: "sourceLine l" + line.line + " li" + line.index }).
                    append(ui).el;
                wu.span({ class: "lineNum" }).text(line.line.toString()).append(ldiv);
                wu.span({ class: 'code' }).
                    text(AstToBasic_1.astToBasic(line.statement, {
                    sourceLineNumber: false
                })).
                    append(ldiv);
                this.renderedSourceLines[line.index] = ldiv;
                if (line.index == 0) {
                    ldiv.classList.add('active');
                }
            }
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
    };
    return GWBASICApp;
}());
new GWBASICApp().init();
//# sourceMappingURL=hello.js.map