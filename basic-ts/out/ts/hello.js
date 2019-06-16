"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SourceUnit_1 = require("./vm/SourceUnit");
var AstToBasic_1 = require("./ast/AstToBasic");
var GWBASICApp = /** @class */ (function () {
    function GWBASICApp() {
        this.suValue = new SourceUnit_1.SourceUnit;
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
                }
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
        this.sourceUnit = this.sourceUnit.parse(command);
    };
    GWBASICApp.prototype.renderSourceUnit = function () {
        if (this.ui.sourceUnit) {
            this.ui.sourceUnit.textContent = AstToBasic_1.astToBasic(this.sourceUnit);
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