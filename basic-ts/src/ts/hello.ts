import * as wu from './WidgetUtil'
import { SourceUnit } from './vm/SourceUnit';
import { astToBasic } from './ast/AstToBasic';

class GWBASICApp {
    get ui() {
        return {
            get sourceUnit() {
                return document.querySelector('#sourceUnit') as HTMLDivElement
            },
            get sourceCode():HTMLTextAreaElement|undefined { 
                return document.querySelector('#sourceCode') as HTMLTextAreaElement
            },
            get parseSourceCode():HTMLButtonElement|undefined { 
                return document.querySelector('#parseSourceCode') as HTMLButtonElement
            },
            get parseError() {
                return document.querySelector('#parseError') as HTMLDivElement
            },
        }
    }

    private suValue: SourceUnit = new SourceUnit
    get sourceUnit():SourceUnit { return this.suValue }
    set sourceUnit( su:SourceUnit ){
        this.suValue = su
        this.renderSourceUnit()
    }

    parseBasic(command:string) {
        try {
            this.sourceUnit = this.sourceUnit.parse( command )
            if( this.ui.parseError ){
                this.ui.parseError.innerHTML = ''
                this.ui.parseError.style.display = 'none'
            }
        } catch ( err ){
            if( this.ui.parseError ){
                this.ui.parseError.textContent = err.toString()
                this.ui.parseError.style.display = ''
                console.log('log parse error:',err.toString())
            }else{
                console.log('log parse error:',err.toString())                
            }
        }
    }

    private renderedSourceLines:{[lineIdx:number]:HTMLElement} = {}

    renderSourceUnit(){
        this.renderedSourceLines = {}
        if( this.ui.sourceUnit ){
            const ui = this.ui.sourceUnit
            ui.innerHTML = ''
            for( let line of this.sourceUnit.lines ){
                const ldiv = wu.
                    div({class:`sourceLine l${line.line} li${line.index}`}).
                    append(ui).el;
                wu.span({class:`lineNum`}).text(line.line.toString()).append(ldiv);
                wu.span({class:'code'}).
                    text(astToBasic(line.statement,{
                        sourceLineNumber:false
                    })).
                    append(ldiv);
                this.renderedSourceLines[line.index] = ldiv
                if( line.index==0 ){
                    ldiv.classList.add( 'active' )
                }
            }
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
