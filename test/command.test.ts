import { test } from "node:test"
import assert from "node:assert/strict"
import { Command } from "../src/device/Command.js"
import { InvalidParameterValueError } from "../src/errors/InvalidParameterValueError.js"

test("extracts a single numeric parameter", async () => {
    const command = new Command("PWR {state:string}", () => {})
    const params = command.match("PWR ON")

    assert.deepEqual(params, { state: "ON" })
})

test("extracts multiple typed parameters", () => {
    const command = new Command("SET CH{channel:number} VOL {value:number}", () => {})
    const params = command.match("SET CH3 VOL -10")

    assert.deepEqual(params, { channel: 3, value: -10 })
})

test("returns null when input doesn't match pattern provided", () => {
    const command = new Command("SET CH{channel:number} VOL {value:number}", () => {})
    const params = command.match("QUERY STATUS")

    assert.deepEqual(params, null)
})

test("throws InvalidParameterValueError when a numeric param isn't numaric", () => {
    const command = new Command("SET CH{channel:number} VOL {value:number}", () => {})
    
    assert.throws(
        () => command.match("SET CHabc VOL -10"),
        InvalidParameterValueError
    )
})