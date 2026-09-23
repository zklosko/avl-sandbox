import type { Framer } from './Framer.js';

export interface DelimeterFramerOptions {
  start: Buffer | number[] | number;
  end: Buffer | number[] | number;
  includeDelimiters?: boolean;
}

export class DelimiterFramer implements Framer {
  #buffer: Buffer = Buffer.alloc(0);
  #start: Buffer;
  #end: Buffer;
  #includeDelimiters: boolean;

  constructor(options: DelimeterFramerOptions) {
    this.#start = DelimiterFramer.#normalize(options.start);
    this.#end = DelimiterFramer.#normalize(options.end);
    this.#includeDelimiters = options.includeDelimiters ?? false;
  }

  static #normalize(value: Buffer | number[] | number): Buffer {
    if (Buffer.isBuffer(value)) return value;
    if (typeof value === 'number') return Buffer.from([value]);
    return Buffer.from(value);
  }

  push(chunk: Buffer): Buffer[] {
    this.#buffer = Buffer.concat([this.#buffer, chunk]);

    const frames: Buffer[] = [];

    while (true) {
      const startIndex = this.#buffer.indexOf(this.#start);

      if (startIndex === -1) {
        const keep = Math.min(this.#buffer.length, this.#start.length - 1);
        this.#buffer = this.#buffer.subarray(this.#buffer.length - keep);
        break;
      }

      if (startIndex > 0) {
        this.#buffer = this.#buffer.subarray(startIndex);
      }

      const contentStart = this.#start.length;
      const endIndex = this.#buffer.indexOf(this.#end, contentStart);

      if (endIndex === -1) break;

      const frame = this.#includeDelimiters
        ? this.#buffer.subarray(0, endIndex + this.#end.length)
        : this.#buffer.subarray(contentStart, endIndex);

      frames.push(Buffer.from(frame));
      this.#buffer = this.#buffer.subarray(endIndex + this.#end.length);
    }

    return frames;
  }
}
