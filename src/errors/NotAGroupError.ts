import { AvlSandboxError } from './AvlSandboxError.js';

export class NotAGroupError extends AvlSandboxError {
  constructor(public readonly name: string) {
    super(`"${name}" is not a defined group`);
  }
}
