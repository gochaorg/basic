/**
 * Интерфейс для реализации вывода на печать
 */
export interface Printer {
    print(value:any):void
    println():void
}

export class ConsolePrinter implements Printer {
    private args : any[] = [];        
    prefix:String = ""

    clone():ConsolePrinter {
        const c = new ConsolePrinter()
        c.args = this.args
        c.prefix = this.prefix
        return c
    }

    configure(x:(inst:ConsolePrinter)=>any):ConsolePrinter {
        x(this)
        return this
    }

    print(value:any):void {
        this.args.push(value)
    }

    println():void {
        console.log(this.prefix+this.args.map(x=>""+x).join(""))
        this.args = []
    }
}

export class CustomPrinter implements Printer {
    readonly printfn:(value:any)=>any
    readonly printlnfn:()=>any

    constructor(printfn:(value:any)=>any, printlnfn:()=>any ){
        this.printfn = printfn
        this.printlnfn = printlnfn
    }

    clone():CustomPrinter {
        return new CustomPrinter(this.printfn, this.printlnfn)
    }

    print(value:any):void {
        this.printfn(value)
    }

    println():void {
        this.printlnfn()
    }
}

export class SingleFnPrinter implements Printer {
    private args : any[] = [];
    readonly printfn:(value:any[])=>any

    constructor(printfn:(value:any[])=>any ){
        this.printfn = printfn
    }

    clone():SingleFnPrinter {
        const c = new SingleFnPrinter(this.printfn)
        this.args.forEach( x => c.args.push(x))
        return c
    }

    print(value:any):void {
        this.args.push(value)
    }

    println():void {
        this.printfn(this.args)
        this.args = []
    }
}

export const printers = {
    console: new ConsolePrinter(),
    custom(printfn:(value:any)=>any, printlnfn:()=>any ):CustomPrinter {
        return new CustomPrinter(printfn, printlnfn)
    },
    sprint(printfn:(value:any[])=>any):SingleFnPrinter {
        return new SingleFnPrinter(printfn)
    }
}
