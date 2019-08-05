"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HtmlElementBuilder {
    constructor(el) {
        this.el = el;
    }
    append(prnt) {
        if (prnt) {
            prnt.appendChild(this.el);
        }
        return this;
    }
    html(v) {
        this.el.innerHTML = v;
        return this;
    }
    text(v) {
        this.el.textContent = v;
        return this;
    }
    attr(name, val) {
        this.el.setAttribute(name, val);
        return this;
    }
    onclick(listener) {
        this.el.addEventListener("click", (ev) => {
            listener(ev);
            return null;
        });
        return this;
    }
}
exports.HtmlElementBuilder = HtmlElementBuilder;
function el(tagname, attribs) {
    const el = document.createElement(tagname);
    if (attribs) {
        for (let k in attribs) {
            let v = attribs[k];
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
function a(attribs) {
    return el('a', attribs);
}
exports.a = a;
function toHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => {
        const n = map[m];
        return n;
    });
}
exports.toHtml = toHtml;
//createEL( 'aa', {a:1,b:2} )
//# sourceMappingURL=WidgetUtil.js.map