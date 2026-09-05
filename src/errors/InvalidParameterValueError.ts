import { AvlSandboxError } from "./AvlSandboxError.js";

export class InvalidParameterValueError extends AvlSandboxError {
    constructor(public readonly paramName: string, public readonly rawValue: string, public readonly expectedType: string) {
        super(`Parameter "${paramName}" with value "${rawValue}" is not a valid ${expectedType}`)
    }
}