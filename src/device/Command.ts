import { InvalidParameterValueError } from "../errors/InvalidParameterValueError.js";
import { PatternCaptureError } from "../errors/PatternCaptureError.js";
import type { MockDevice } from "./MockDevice.js";

export type ParamType = "string" | "number"

interface ParsedPattern {
    regex: RegExp;
    paramTypes: Record<string, ParamType>
}

function parsePattern(pattern: string): ParsedPattern {
    const paramTypes: Record<string, ParamType> = {}

    const regexStr = pattern.replace(/\{(\w+):(\w+)\}/g, (_, name, type) => {
        paramTypes[name] = type as ParamType
        return `(.+?)`
    })

    return {
        regex: new RegExp(`^${regexStr}$`),
        paramTypes
    }
}

/** Holds a command for the mock device to respond to */
export class Command {
    #parsed: ParsedPattern

    constructor(
        public readonly pattern: string,
        public readonly handler: (device: MockDevice, params: Record<string, string | number>) => string | void,
    ) {
        this.#parsed = parsePattern(pattern)
    }

    match(input: string): Record<string, string | number> | null {
        const result = this.#parsed.regex.exec(input)
        if (!result) return null

        const params: Record<string, string | number> = {}
        const names = Object.keys(this.#parsed.paramTypes)

        for (const [i, name] of names.entries()) {
            const raw = result[i+1]
            if (raw === undefined) {
                throw new PatternCaptureError(this.pattern, name)
            }

            const type = this.#parsed.paramTypes[name]
            if (type === "number") {
                const num = Number(raw)
                if (Number.isNaN(num)) throw new InvalidParameterValueError(name, raw, "number")
                params[name] = num
            } else {
                params[name] = raw
            }
        }

        return params
    }
}