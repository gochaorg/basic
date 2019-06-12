export class Memo {
    values: { [name :string]:any } = {}
    read(varname:string):any {
        console.log(`debug read var ${varname}`)
        return this.values[varname]
    }
    write(varname:string, value:any) {
        console.log(`debug write var ${varname} = ${value}`)
        this.values[varname] = value
    }
}