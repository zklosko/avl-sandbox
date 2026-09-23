import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PassthroughFramer } from '../src/protocol/PassthroughFramer.js';

test('returns the chunk unchanged as a single frame', () => {
  const framer = new PassthroughFramer();
  const frames = framer.push(Buffer.from('PWR?'));

  assert.equal(frames.length, 1);
  assert.equal(frames[0]?.toString(), 'PWR?');
});

test('does not buffer between calls — each push is independent', () => {
  const framer = new PassthroughFramer();

  const first = framer.push(Buffer.from('ONE'));
  const second = framer.push(Buffer.from('TWO'));

  assert.equal(first[0]?.toString(), 'ONE');
  assert.equal(second[0]?.toString(), 'TWO');
});
