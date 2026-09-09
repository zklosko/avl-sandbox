import { IndexOutOfRangeError } from '../errors/IndexOutOfRangeError.js';
import { NotAGroupError } from '../errors/NotAGroupError.js';
import { UnknownStateError } from '../errors/UnknownStateError.js';

export type GroupTemplate = Record<string, unknown> | ((container: StateContainer) => void);

export interface StateContainer {
  defineState<T>(name: string, value: T): void;
  getState<T>(name: string): T;
  setState(name: string, value: unknown): void;
  group(name: string, count: number, template: GroupTemplate): void;
  at(name: string, index: number): StateContainer;
}

export class DeviceState implements StateContainer {
  #values = new Map<string, unknown>();
  #groups = new Map<string, DeviceState[]>();

  defineState<T>(name: string, value: T): void {
    this.#values.set(name, value);
  }

  getState<T>(name: string): T {
    if (!this.#values.has(name)) throw new UnknownStateError(name);
    return this.#values.get(name) as T;
  }

  setState(name: string, value: unknown): void {
    if (!this.#values.has(name)) throw new UnknownStateError(name);
    this.#values.set(name, value);
  }

  group(name: string, count: number, template: GroupTemplate): void {
    const entries = Array.from({ length: count }, () => {
      const entry = new DeviceState();
      if (typeof template === 'function') {
        template(entry);
      } else {
        for (const [key, value] of Object.entries(template)) {
          entry.defineState(key, value);
        }
      }
      return entry;
    });
    this.#groups.set(name, entries);
  }

  at(name: string, index: number): StateContainer {
    const entries = this.#groups.get(name);
    if (!entries) throw new NotAGroupError(name);

    const entry = entries[index - 1];
    if (!entry) throw new IndexOutOfRangeError(name, index, entries.length);

    return entry;
  }
}
