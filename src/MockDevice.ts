import { UdpTransport } from "./UdpTransport.js";

export class MockDevice {
    #state = new Map<string, unknown>()
    #commands = new Map<string,(device: MockDevice) => string | void>()
    #transport: UdpTransport

    constructor(transport: UdpTransport) {
        this.#transport = transport

        this.#transport.on("message", (message, remote) => {
            this.#handleMessage(message, remote)
        })
    }

    defineState(name: string, value: unknown): void {
        this.#state.set(name, value)
    }

    getState<T>(name: string): T {
        return this.#state.get(name) as T
    }

    setState(name: string, value: unknown): void {
        this.#state.set(name, value)
    }

    command(name: string, handler: (device: MockDevice) => string | void): void {
        this.#commands.set(name, handler)
    }

    async start(): Promise<void> {
        await this.#transport.start()
    }

    stop(): void {
        this.#transport.stop()
    }

    #handleMessage(message: string, remote: {address: string, port: number}): void {
        const handler = this.#commands.get(message.trim())

        if (!handler) return

        const response = handler(this) // ?

        if (response !== undefined) {
            this.#transport.send(response, remote.port, remote.address)
        }
    }
}