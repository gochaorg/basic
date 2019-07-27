import * as wu from './ui/WidgetUtil'
import { SourceUnit, ParseResult } from './vm/SourceUnit';
import { astToBasic } from './ast/AstToBasic';
import { Memo } from './vm/Memo';
import { BasicVm } from './vm/BasicVm';
import { Statement } from './ast/Statement';
import { printers, Printer } from './vm/Printer';

type MemVarUI = {
    container:HTMLDivElement
    name:HTMLElement
    value:HTMLElement
}

class GWBASICApp {
    //#region ui
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
            get goNext() {
                return document.querySelector('#goNext') as HTMLElement
            },
            get memoDump() { return document.querySelector('#memoDump') as HTMLDivElement },
            get helpContent() { return document.querySelector('#helpContent') as HTMLDivElement },
            get showHelp() { return document.querySelector('#showHelp') as HTMLElement },
            get closeHelp() { return document.querySelector('#closeHelp') as HTMLElement },
            get output() { return  document.querySelector('#output') as HTMLDivElement },
            get clearOutput() { 
                return document.querySelector('#clearOutput') as HTMLButtonElement
            }
        }
    }
    //#endregion

    //#region sourceUnit
    private suValue: SourceUnit = new SourceUnit
    get sourceUnit():SourceUnit { return this.suValue }
    set sourceUnit( su:SourceUnit ){
        this.suValue = su
        setTimeout(()=>{this.renderSourceUnit()},1)
    }

    parseBasic(command:string) {
        try {
            let imStmts:Statement[] = []
            this.sourceUnit = this.sourceUnit.parse( command, {
                immediateStatements(statements){                    
                    imStmts = statements
                }
            })
            this.rebuildVm()
            if( this.ui.parseError ){
                this.ui.parseError.innerHTML = ''
                this.ui.parseError.style.display = 'none'
            }
            for( let imSt of imStmts ){
                this.vm.evalStatement( imSt )
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
                wu.a({class:'goto',href:'#'}).text('goto').append(ldiv).onclick(e=>{
                    this.goto(line.index)
                })
                this.renderedSourceLines[line.index] = ldiv
                if( this.vm.ip == line.index ){
                    ldiv.classList.add('active')
                }
            }
        }
    }
    //#endregion

    //#region memo
    private memoInstance?:Memo = new Memo()
    get memo():Memo { 
        if( this.memoInstance ) return this.memoInstance 
        this.memoInstance = new Memo()
        setTimeout(()=>{this.renderMemo()},1)
        return this.memoInstance
    }
    set memo( mem:Memo ){
        this.memoInstance = mem
        setTimeout(()=>{this.renderMemo()},1)
    }
    renderMemo(){
        if( this.ui.memoDump ){
            this.ui.memoDump.innerHTML = ''
            for( const varname of this.memo.varnames ){
                const varvalue = this.memo.read(varname)
            }
        }
    }
    private uiVars:{[name:string]:MemVarUI} = {}
    renderMemoVar(varname:string,oldvalue:any,newvalue:any){
        if( newvalue!=undefined ){
            let ui = this.uiVars[varname]
            if( ui ){
                ui.value.innerText = newvalue
            }else{
                ui = {
                    container: wu.div({class:'var'}).el,
                    name: wu.span({class:'name'}).text(varname).el,
                    value: wu.span({class:'value'}).text(newvalue).el
                }
                ui.container.appendChild( ui.name )
                ui.container.appendChild( ui.value )
                this.uiVars[varname] = ui
                if( this.ui.memoDump ){
                    this.ui.memoDump.appendChild( ui.container )
                }
            }
        }
    }
    //#endregion

    //#region vm
    private get vmPrinter():Printer{
        if( this.ui.output ){
            return printers.sprint( (args:any[])=>{
                let txt = args.map(x=>""+x).join("")
                this.ui.output.innerHTML += wu.toHtml(txt)+"<br/>"
            })
        }else{
            return printers.console.clone().configure(c=>{c.prefix="BASIC> "})
        }
    }
    private vmInstance?:BasicVm
    get vm():BasicVm{ 
        if( this.vmInstance )return this.vmInstance
        this.vmInstance = new BasicVm(this.sourceUnit, this.memo)
        this.vmInstance.printer = this.vmPrinter
        setTimeout(()=>{this.renderVm()},1)
        return this.vmInstance
    }
    set vm(v:BasicVm){
        this.vmInstance = v
        setTimeout(()=>{this.renderVm()},1)
    }
    rebuildVm() {
        this.vmInstance = new BasicVm(this.sourceUnit, this.memo)
        this.vmInstance.printer = this.vmPrinter
        setTimeout(()=>{this.renderVm()},1)
        return this.vmInstance
    }
    renderVm(){
        this.renderIp()
    }
    //#endregion

    //#region goto/renderIp
    goto(ip:number){
        console.log(`goto ip=${ip}`)
        this.vm.ip = ip
        setTimeout(()=>{this.renderIp()}, 1)
    }
    renderIp(){
        for( let i=0; i<Object.getOwnPropertyNames(this.renderedSourceLines).length; i++ ){
            this.renderedSourceLines[i].classList.remove('active')
        }

        const lineDiv = this.renderedSourceLines[this.vm.ip]
        if( lineDiv ){
            lineDiv.classList.add('active')
        }
    }
    //#endregion

    //#region goNext
    goNext(){
        console.log('goNext() clicked')
        if( this.vm.hasNext() ){
            this.vm.next()
            this.renderIp()
        }
    }
    //#endregion

    init(){
        if( this.ui.parseSourceCode && this.ui.sourceCode ){
            const btn = this.ui.parseSourceCode
            const txt = this.ui.sourceCode
            btn.addEventListener('click', e=>this.parseBasic(txt.value))

            txt.addEventListener('keydown',(e)=>{
                if( e.keyCode==13 && e.ctrlKey ){
                    this.parseBasic(txt.value)
                }else if( e.code=='KeyN' && e.altKey ){
                    this.goNext()
                }else{
                    //console.log('keydown',e)
                }
            })
        }

        if( this.ui.goNext ){
            this.ui.goNext.addEventListener('click', e=>this.goNext())
        }

        this.memo.listeners.push( (varname,from,to)=>{
            console.log('handled var changes ',varname,from,to)
            this.renderMemoVar(varname,from,to)
        })

        if( this.ui.showHelp ){
            this.ui.showHelp.addEventListener('click',e=>{
                if( this.ui.helpContent ){
                    this.ui.helpContent.classList.add('active')
                    console.log("clicked 1")
                }
            })
        }
        if( this.ui.closeHelp ){
            this.ui.closeHelp.addEventListener('click',e=>{
                if( this.ui.helpContent ){
                    this.ui.helpContent.classList.remove('active')
                    console.log("clicked 2")
                }
            })
        }
        if( this.ui.clearOutput ){
            this.ui.clearOutput.addEventListener('click',e=>{
                if( this.ui.output ){
                    this.ui.output.innerHTML = ""
                }
            })
        }
    }
}

new GWBASICApp().init()
