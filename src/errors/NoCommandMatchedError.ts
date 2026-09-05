import { AvlSandboxError } from "./AvlSandboxError.js";

export class NoCommandMatchedError extends AvlSandboxError {
    constructor(public readonly input: string) {
        super(`No command matched input "${input}"`)
    }
}