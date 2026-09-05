export interface TransportClient {
    send(message: string): void
}

export interface Transport {
    start(): Promise<void>
    stop(): Promise<void>

    on(
        event: "message",
        listener: (message: string, client: TransportClient) => void
    ): this
}