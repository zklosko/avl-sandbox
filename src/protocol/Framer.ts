/** Feed newly received bytes */
export interface Framer {
  push(chunk: Buffer): Buffer[];
}
