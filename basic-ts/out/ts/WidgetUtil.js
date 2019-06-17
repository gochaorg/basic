"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HtmlElementBuilder = /** @class */ (function () {
    function HtmlElementBuilder(el) {
        this.el = el;
    }
    HtmlElementBuilder.prototype.append = function (prnt) {
        if (prnt) {
            prnt.appendChild(this.el);
        }
        return this;
    };
    HtmlElementBuilder.prototype.html = function (v) {
        this.el.innerHTML = v;
        return this;
    };
    HtmlElementBuilder.prototype.text = function (v) {
        this.el.textContent = v;
        return this;
    };
    HtmlElementBuilder.prototype.attr = function (name, val) {
        this.el.setAttribute(name, val);
        return this;
    };
    HtmlElementBuilder.prototype.onclick = function (listener) {
        this.el.addEventListener("click", function (ev) {
            listener(ev);
            return null;
        });
        return this;
    };
    return HtmlElementBuilder;
}());
exports.HtmlElementBuilder = HtmlElementBuilder;
function el(tagname, attribs) {
    var el = document.createElement(tagname);
    if (attribs) {
        for (var k in attribs) {
            var v = attribs[k];
            if (typeof (v) == 'string') {
                el.setAttribute(k, v);
            }
            else if (typeof (v) == 'number') {
                el.setAttribute(k, '' + v);
            }
            else if (typeof (v) == 'boolean') {
                el.setAttribute(k, v ? 'true' : 'false');
            }
        }
    }
    return new HtmlElementBuilder(el);
}
exports.el = el;
function div(attribs) {
    return el('div', attribs);
}
exports.div = div;
function span(attribs) {
    return el('span', attribs);
}
exports.span = span;
function input(attribs) {
    return el('input', attribs);
}
exports.input = input;
function textInput(attribs) {
    return el('input', attribs).attr('type', 'text');
}
exports.textInput = textInput;
function textArea(attribs) {
    return el('textarea', attribs);
}
exports.textArea = textArea;
function button(attribs) {
    return el('button', attribs);
}
exports.button = button;
//createEL( 'aa', {a:1,b:2} )
//# sourceMappingURL=WidgetUtil.js.map