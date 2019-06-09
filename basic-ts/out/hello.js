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
var GWBASICApp = /** @class */ (function () {
    function GWBASICApp() {
    }
    Object.defineProperty(GWBASICApp.prototype, "root", {
        //#region root : HTMLElement
        get: function () {
            return document.getElementById('app');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GWBASICApp.prototype, "appInnerHtml", {
        get: function () {
            if (this.root) {
                return this.root.innerHTML;
            }
            return null;
        },
        set: function (html) {
            if (html && this.root) {
                this.root.innerHTML = html;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GWBASICApp.prototype, "sourceBlock", {
        //#endregion
        //#region sourceBlock : HTMLElement
        get: function () {
            if (this.root) {
                return this.root.querySelector('.source');
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    //#endregion
    GWBASICApp.prototype.init = function () {
        var _this = this;
        if (this.root) {
            // header
            wu.div().html('Like GWBasic').append(this.root);
            // source block
            wu.div({ class: 'source' }).append(this.root);
            // eval block
            var evalBlock = wu.div({ class: 'eval' }).append(this.root).el;
            var inp1_1 = wu.textInput().append(evalBlock).el;
            wu.button().html('eval').onclick(function (e) { return _this.gwBasicEval(inp1_1.value); }).append(evalBlock);
        }
    };
    GWBASICApp.prototype.gwBasicEval = function (command) {
        if (this.sourceBlock) {
            this.sourceBlock.textContent = command;
        }
        console.log('eval command ' + command);
    };
    return GWBASICApp;
}());
new GWBASICApp().init();
//# sourceMappingURL=hello.js.map