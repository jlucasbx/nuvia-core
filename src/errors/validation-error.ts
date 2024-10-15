import { IFieldErrorDescriptor } from "@types"


export class ValidationError extends Error{
    readonly errors: IFieldErrorDescriptor[]
    constructor(message: string, errors: IFieldErrorDescriptor[]) {
        super(message)
        this.errors = errors
    }
}
