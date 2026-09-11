import type { Framer } from './Framer.js';

export interface LineFramerOptions {
  /** Byte value that marks end of frame, in hex */
  terminator?: Buffer | number[] | number;
  stripTrailingCr?: boolean;
}

/**
 * Defaults to Telnet settings
 */
export class LineFramer implements Framer {
  #buffer: Buffer = Buffer.alloc(0);
  #terminator: Buffer;
  #stripTrailingCr: boolean;

  constructor(options: LineFramerOptions = {}) {
    this.#terminator = LineFramer.#normalizeTerminator(options.terminator ?? 0x0a);
    this.#stripTrailingCr = options.stripTrailingCr ?? true;
  }

  static #normalizeTerminator(terminator: Buffer | number[] | number): Buffer {
    if (Buffer.isBuffer(terminator)) return terminator;
    if (typeof terminator === 'number') return Buffer.from([terminator]);
    return Buffer.from(terminator);
  }

  push(chunk: Buffer): Buffer[] {
    this.#buffer = Buffer.concat([this.#buffer, chunk]);

    const frames: Buffer[] = [];
    let index: number;

    while ((index = this.#buffer.indexOf(this.#terminator)) !== -1) {
      let line = this.#buffer.subarray(0, index);

      // strip trailing \r if present
      if (this.#stripTrailingCr && line.length > 0 && line[line.length - 1] === 0x0d) {
        line = line.subarray(0, line.length - 1);
      }

      frames.push(Buffer.from(line));
      this.#buffer = this.#buffer.subarray(index + this.#terminator.length);
    }

    return frames;
  }
}
