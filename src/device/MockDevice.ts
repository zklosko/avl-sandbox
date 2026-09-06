import EventEmitter from 'events';
import { NoCommandMatchedError } from '../errors/NoCommandMatchedError.js';
import { Message } from '../protocol/Message.js';
import { Response } from '../protocol/Response.js';
import type { Transport, TransportClient } from '../transport/Transport.js';
import { Command } from './Command.js';

/** Base class for building a mock device */
export class MockDevice extends EventEmitter {
  #state = new Map<string, unknown>();
  #commands: Command[] = [];
  #transport: Transport;

  constructor(transport: Transport) {
    super();
    this.#transport = transport;

    this.#transport.on('message', this.#handleMessage.bind(this));
  }

  /**
   * Creates state parameter on mock device and initializes with data
   * @param name name of parameter
   * @param value initial value of parameter
   */
  defineState(name: string, value: unknown): void {
    this.#state.set(name, value);
  }

  /**
   * Returns current value of state parameter. Needs type definition for parameter.
   * @param name name of parameter
   * @returns current value of parameter
   */
  getState<T>(name: string): T {
    return this.#state.get(name) as T;
  }

  /**
   * Set a new value of a current state parameter.
   *
   * Warning: Type cannot be changed here.
   * @param name name of parameter
   * @param value new value of parameter
   */
  setState(name: string, value: unknown): void {
    this.#state.set(name, value);
  }

  /**
   * Set a new command for the device to react to
   * @param pattern string for mock device to listen to
   * @param handler callback function with device as parameter
   */
  command(
    pattern: string,
    handler: (device: MockDevice, params: Record<string, string | number>) => string | void,
  ): void {
    this.#commands.push(new Command(pattern, handler));
  }

  /** Initialize device */
  async start(): Promise<void> {
    await this.#transport.start();
  }

  /** Stop device simulation */
  stop(): void {
    this.#transport.stop();
  }

  /**
   * Handles incoming message from networked device
   * @param raw raw command string
   * @param client attached client for response
   */
  #handleMessage(raw: string, client: TransportClient): void {
    const message = new Message(raw);

    for (const command of this.#commands) {
      const params = command.match(message.raw);
      if (params) {
        const result = command.handler(this, params);
        if (result) client.send(new Response(result).raw);
        return;
      }
    }

    this.emit('error', new NoCommandMatchedError(message.raw));
  }
}
