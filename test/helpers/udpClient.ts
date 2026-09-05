import dgram from "node:dgram"

export function sendUdp(message: string, port: number, host = "127.0.0.1"): Promise<string> {
    return new Promise((resolve, reject) => {
        const socket = dgram.createSocket("udp4")
        const timeout = setTimeout(() => {
            socket.close()
            reject(new Error('UDP response timeout'))
        }, 1000)

        socket.on("message", (response) => {
            clearTimeout(timeout)
            socket.close()
            resolve(response.toString())
        })

        socket.on("error", (error) => {
            clearTimeout(timeout)
            socket.close()
            reject(error)
        })

        socket.send(Buffer.from(message), port, host)
    })
}

export class TestUdpClient {
    #socket: dgram.Socket
    #port: number
    #host: string

    private constructor(socket: dgram.Socket, port: number, host: string) {
        this.#socket = socket
        this.#port = port
        this.#host = host
    }

    static connect(port: number, host = "127.0.0.1"): Promise<TestUdpClient> {
        return new Promise((resolve) => {
            const socket = dgram.createSocket("udp4")
            resolve(new TestUdpClient(socket, port, host))
        })
    }

    send(message: string): void {
        const data = Buffer.from(message)
        this.#socket.send(data, this.#port, this.#host)
    }

    waitForMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.#socket.once("message", (data: Buffer) => resolve(data.toString()))
            this.#socket.once("error", reject)
        })
    }

    close(): Promise<void> {
        return new Promise((resolve) => {
            this.#socket.close(() => resolve())
        })
    }
}