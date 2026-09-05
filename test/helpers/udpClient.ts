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