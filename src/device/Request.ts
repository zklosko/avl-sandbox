import type { Command } from './Command.js';
import type { Message } from './Message.js';

/**
 * A class holding the request received by an external networked device
 */
export class Request {
  constructor(
    public readonly message: Message,
    public readonly command: Command,
    public readonly params: Record<string, string | number>,
  ) {}
}
