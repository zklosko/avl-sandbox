import { AvlSandboxError } from './AvlSandboxError.js';

export class UnknownStateError extends AvlSandboxError {
  constructor(public readonly name: string) {
    super(`No state defined with name "${name}"`);
  }
}
