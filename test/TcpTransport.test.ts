import { test, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import { TcpTransport } from "../src/transport/TcpTransport.js"
import { TestTcpClient } from "./helpers/tcpClient.js"

let transport: TcpTransport
let client: TestTcpClient

beforeEach(async () => {
    transport = new TcpTransport({ port: 0})
    await transport.start()
    client = await TestTcpClient.connect(transport.port)
})

afterEach(async () => {
    await client.close()
    await transport.stop()
})

test("responds to a single command", async () => {
    transport.on("message", (message, transportClient) => {
        if (message === "PWR?") {
            transportClient.send("PWR OFF")
        }
    })

    client.send("PWR?")
    const reply = await client.waitForMessage()

    assert.equal(reply, "PWR OFF")
})

test("handles multiple simultaneous clients independently", async () => {
    const clientA = await TestTcpClient.connect(transport.port)
    const clientB = await TestTcpClient.connect(transport.port)

    transport.on("message", (message, transportClient) => {
        transportClient.send(`ACK: ${message}`)
    })

    clientA.send("HELLO A")
    clientB.send("HELLO B")

    const [replyA, replyB] = await Promise.all([
        clientA.waitForMessage(),
        clientB.waitForMessage()
    ])

    assert.equal(replyA, "ACK: HELLO A")
    assert.equal(replyB, "ACK: HELLO B")

    await clientA.close()
    await clientB.close()
})

test("stop() closes server and rejects new connections", async () => {
    const port = transport.port  // capture before killing connection

    await client.close()
    await transport.stop()

    await assert.rejects(
        () => TestTcpClient.connect(port),
        /ECONNREFUSED/
    )
})

test("handle abrupt client disconnect without crashing", async () => {
    const messages: string[] = []
    transport.on("message", (msg) => messages.push(msg))

    client.send("HELLO")
    await new Promise((r) => setTimeout(r, 50))  // let the message land

    client.destroy()
    await new Promise((r) => setTimeout(r, 50))  // give transport time to process the disconnect

    const newClient = await TestTcpClient.connect(transport.port)
    newClient.send("STILL ALIVE")
    await new Promise((r) => setTimeout(r, 50))

    assert.deepEqual(messages, ["HELLO", "STILL ALIVE"])

    await newClient.close()
})