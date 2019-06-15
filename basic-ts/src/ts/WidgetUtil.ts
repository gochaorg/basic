export class HtmlElementBuilder<EL extends HTMLElement> {
    el : EL
    constructor( el : EL ){
        this.el = el
    }
    append( prnt?: HTMLElement ):HtmlElementBuilder<EL> {
        if( prnt ){
            prnt.appendChild(this.el)
        }
        return this
    }
    html(v:string):HtmlElementBuilder<EL> {
        this.el.innerHTML = v
        return this
    }
    attr(name:string, val:string):HtmlElementBuilder<EL> {
        this.el.setAttribute(name, val)
        return this
    }
    onclick(listener:(e:Event)=>any):HtmlElementBuilder<EL> {
        this.el.addEventListener(
            "click",
            (ev:Event) => {
                listener(ev)
                return null;
            }
        )
        return this
    }
}
export function el<EL extends HTMLElement>(tagname:string, attribs?: {[index:string]:any}) : HtmlElementBuilder<EL> {
    const el  = document.createElement( tagname )
    if( attribs ){
        for( let k in attribs ){
            let v = attribs[k];
            if( typeof(v)=='string' ){
                el.setAttribute(k,v)
            }else if( typeof(v)=='number' ){
                el.setAttribute(k,''+v)
            }else if( typeof(v)=='boolean' ){
                el.setAttribute(k, v?'true':'false' )
            }
        }
    }
    return new HtmlElementBuilder<EL>( el as EL )
}
export function div( attribs?: {[index:string]:any} ) : HtmlElementBuilder<HTMLDivElement> {
    return el( 'div', attribs )
}
export function span( attribs?: {[index:string]:any} ) : HtmlElementBuilder<HTMLSpanElement> {
    return el( 'span', attribs )
}
export function input( attribs?: {[index:string]:any} ) : HtmlElementBuilder<HTMLInputElement> {
    return el( 'input', attribs )
}
export function textInput( attribs?: {[index:string]:any} ) {
    return el<HTMLInputElement>('input',attribs).attr('type','text')
}
export function textArea( attribs?: {[index:string]:any} ) {
    return el<HTMLTextAreaElement>('textarea',attribs)
}
export function button( attribs?: {[index:string]:any} ) : HtmlElementBuilder<HTMLButtonElement> {
    return el( 'button', attribs )
}

//createEL( 'aa', {a:1,b:2} )