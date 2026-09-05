import dgram from "node:dgram"
import { EventEmitter } from "node:events"
import type { Transport, TransportClient } from "./Transport.js";

export interface UdpTransportOptions {
    port: number;
    host?: string;
}

class UdpClient implements TransportClient {
    constructor(
        private socket: dgram.Socket,
        private port: number,
        private address: string
    ) {}

    send(message: string): void {
        this.socket.send(
            Buffer.from(message),
            this.port,
            this.address
        )
    }
}

/**
 * Creates UDP server to listen to commands and respond
 */
export class UdpTransport extends EventEmitter implements Transport {
    #socket = dgram.createSocket("udp4")
    options: UdpTransportOptions

    constructor(options: UdpTransportOptions) {
        super()

        this.options = options

        this.#socket.on("message", (message, remote) => {
            const client = new UdpClient(
                this.#socket,
                remote.port,
                remote.address
            )

            this.emit("message", message.toString(), client)
        })
    }

    /**
     * Starts UDP server
     */
    start(): Promise<void> {
        return new Promise((resolve) => {
            this.#socket.bind(
                this.options.port,
                this.options.host ?? "0.0.0.0", // don't know if I want to do that
                () => resolve()
            )
        })
    }

    /**
     * Sends message to UDP target
     * @param message 
     * @param port 
     * @param address 
     */
    send(message: string, port: number, address: string): void {
        const data = Buffer.from(message)

        this.#socket.send(data, port, address)
    }

    /**
     * Stops UDP server
     */
    stop(): Promise<void> {
        return new Promise((resolve) => {
            this.#socket.close(() => resolve())
        })
    }

    get port(): number {
        const address = this.#socket.address()

        if (typeof address === "string") throw new Error ("Socket is not bound")

        return address.port
    }
}