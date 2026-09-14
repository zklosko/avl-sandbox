import type { Framer } from './Framer.js';

export class PassthroughFramer implements Framer {
  push(chunk: Buffer): Buffer[] {
    return [chunk];
  }
}
