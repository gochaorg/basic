import * as wu from './WidgetUtil'
import { SourceUnit } from './vm/SourceUnit';
import { astToBasic } from './ast/AstToBasic';

class GWBASICApp {
    get ui() {
        return {
            get sourceUnit() {
                return document.querySelector('#sourceUnit')
            },
            get sourceCode():HTMLTextAreaElement|undefined { 
                return document.querySelector('#sourceCode') as HTMLTextAreaElement
            },
            get parseSourceCode():HTMLButtonElement|undefined { 
                return document.querySelector('#parseSourceCode') as HTMLButtonElement
            }
        }
    }

    private suValue: SourceUnit = new SourceUnit
    get sourceUnit():SourceUnit { return this.suValue }
    set sourceUnit( su:SourceUnit ){
        this.suValue = su
        this.renderSourceUnit()
    }

    parseBasic(command:string) {
        this.sourceUnit = this.sourceUnit.parse( command )
    }

    renderSourceUnit(){
        if( this.ui.sourceUnit ){
            this.ui.sourceUnit.textContent = astToBasic(this.sourceUnit)
        }
    }

    init(){
        if( this.ui.parseSourceCode && this.ui.sourceCode ){
            const btn = this.ui.parseSourceCode
            const txt = this.ui.sourceCode
            btn.addEventListener('click', e=>this.parseBasic(txt.value))

            txt.addEventListener('keydown',(e)=>{
                if( e.keyCode==13 && e.ctrlKey ){
                    this.parseBasic(txt.value)
                }
            })
        }
    }
}

new GWBASICApp().init()
