import net from 'node:net';
import { EventEmitter } from 'node:events';
import type { Transport, TransportClient } from './Transport.js';
import type { Framer } from '../protocol/Framer.js';
import { PassthroughFramer } from '../protocol/PassthroughFramer.js';

export interface TcpTransportOptions {
  port: number;
  host?: string;
  framer?: Framer;
}

class TcpClient implements TransportClient {
  constructor(private socket: net.Socket) {}

  send(message: string): void {
    this.socket.write(Buffer.from(message));
  }
}

/**
 * Creates TCP server to listen to commands and respond
 */
export class TcpTransport extends EventEmitter implements Transport {
  #server = net.createServer();
  #clients = new Set<net.Socket>();
  options: TcpTransportOptions;

  constructor(options: TcpTransportOptions) {
    super();
    this.options = options;

    this.#server.on('connection', (socket: net.Socket) => {
      this.#clients.add(socket);
      const client = new TcpClient(socket);
      const framer = this.options.framer ?? new PassthroughFramer();

      socket.on('data', (data: Buffer) => {
        const frames = framer.push(data);
        for (const f of frames) {
          this.emit('message', f.toString(), client);
        }
      });

      socket.on('error', (e) => {
        console.error(`TCP client socket error: ${e.message}`);
        this.#clients.delete(socket);
      });

      socket.on('end', () => {
        this.#clients.delete(socket);
        console.log('TCP connected ended');
      });
    });
  }

  /**
   * Starts TCP server
   */
  start(): Promise<void> {
    return new Promise((resolve) => {
      this.#server.listen(this.options.port, this.options.host ?? '0.0.0.0', () => resolve());
    });
  }

  /**
   * Stops TCP server and closes client connections
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      for (const socket of this.#clients) socket.destroy();
      this.#server.close(() => resolve());
    });
  }

  /** Returns port number for testing applications */
  get port(): number {
    const address = this.#server.address();
    if (address === null || typeof address === 'string') throw new Error('Socket is not bound');
    return address.port;
  }
}
