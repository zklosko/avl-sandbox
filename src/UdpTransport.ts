import dgram from "node:dgram"
import { EventEmitter } from "node:events"

export interface UdpTransportOptions {
    port: number;
    host?: string;
}

/**
 * Creates UDP server to listen to commands and respond
 */
export class UdpTransport extends EventEmitter {
    #socket = dgram.createSocket("udp4")
    options: UdpTransportOptions

    constructor(options: UdpTransportOptions) {
        super()

        this.options = options

        this.#socket.on("message", (message, remote) => {
            this.emit("message", message.toString(), remote)
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
    stop(): void {
        this.#socket.close()
    }

    get port(): number {
        const address = this.#socket.address()

        if (typeof address === "string") throw new Error ("Socket is not bound")

        return address.port
    }
}