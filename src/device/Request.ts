import type { Command } from "./Command.js";
import type { Message } from "./Message.js";

export class Request {
    constructor(
        public readonly message: Message,
        public readonly command: Command,
        public readonly params: Record<string, string | number>
    ) {}
}