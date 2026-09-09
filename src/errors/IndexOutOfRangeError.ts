import { AvlSandboxError } from './AvlSandboxError.js';

export class IndexOutOfRangeError extends AvlSandboxError {
  constructor(
    public readonly name: string,
    public readonly index: number,
    public readonly count: number,
  ) {
    super(`Index ${index} is out of range for group "${name}" (size ${count})`);
  }
}
