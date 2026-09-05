import EventEmitter from "events";
import { NoCommandMatchedError } from "../errors/NoCommandMatchedError.js";
import { Message } from "./Message.js";
import { Response } from "./Response.js";
import type { Transport, TransportClient } from "../transport/Transport.js";
import { Command } from "./Command.js";

export class MockDevice extends EventEmitter {
    #state = new Map<string, unknown>()
    #commands: Command[] = []
    #transport: Transport

    constructor(transport: Transport) {
        super()
        this.#transport = transport

        this.#transport.on("message", this.#handleMessage.bind(this))
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

    command(pattern: string, handler: (device: MockDevice, params: Record<string, string | number>) => string | void): void {
        this.#commands.push(new Command(pattern, handler))
    }

    async start(): Promise<void> {
        await this.#transport.start()
    }

    stop(): void {
        this.#transport.stop()
    }

    #handleMessage(raw: string, client: TransportClient): void {
        const message = new Message(raw)

        for (const command of this.#commands) {
            const params = command.match(message.raw)
            if (params) {
                const result = command.handler(this, params)
                if (result) client.send(new Response(result).raw)
                return
            }
        }

        this.emit("error", new NoCommandMatchedError(message.raw));
    }
}