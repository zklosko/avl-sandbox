import net from "node:net"

export class TestTcpClient {
    #socket: net.Socket

    private constructor(socket: net.Socket) {
        this.#socket = socket
    }

    static connect(port: number, host = "127.0.0.1"): Promise<TestTcpClient> {
        return new Promise((resolve, reject) => {
            const socket = net.connect(port, host)
            socket.once("connect", () => resolve(new TestTcpClient(socket)))
            socket.once("error", reject)
        })
    }

    send(message: string): void {
        this.#socket.write(Buffer.from(message))
    }

    waitForMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.#socket.once("data", (data: Buffer) => resolve(data.toString()))
            this.#socket.once("error", reject)
        })
    }

    close(): Promise<void> {
        return new Promise((resolve) => {
            this.#socket.end(() => resolve())
        })
    }
}