import * as wu from './WidgetUtil'
//const s = require('./Button.css');

class GWBASICApp {
    //#region root : HTMLElement
    get root(): HTMLElement|null {
        return document.getElementById('app');
    }
    get appInnerHtml():string|null {
        if( this.root ){
            return this.root.innerHTML
        }
        return null
    }
    set appInnerHtml(html:string|null) {
        if( html && this.root ){
            this.root.innerHTML = html
        }
    }
    //#endregion
    //#region sourceBlock : HTMLElement
    get sourceBlock() {
        if( this.root ){
            return this.root.querySelector('.source')
        }
        return null
    }
    //#endregion
    init(){
        if( this.root ){
            // header
            // wu.div().html('Like GWBasic').append(this.root)

            // source block
            // wu.div({class:'source'}).append(this.root)

            // eval block
            const evalBlock = wu.div({class:'eval'}).append(this.root).el
            const inp1 = wu.textArea().append(evalBlock).el
            wu.button().html('eval').onclick( e => this.gwBasicEval(inp1.value) ).append(evalBlock)
        }
    }

    gwBasicEval(command:string) {
        if( this.sourceBlock ){
            this.sourceBlock.textContent = command
        }
        console.log('eval command '+command)
    }
}

new GWBASICApp().init()
