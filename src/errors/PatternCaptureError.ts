import { AvlSandboxError } from './AvlSandboxError.js';

export class PatternCaptureError extends AvlSandboxError {
  constructor(
    public readonly pattern: string,
    public readonly paramName: string,
  ) {
    super(`Command pattern "${pattern}" failed to capture parameter "${paramName}"`);
  }
}
