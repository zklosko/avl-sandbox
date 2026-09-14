import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LineFramer } from '../src/protocol/LineFramer.js';

test('emits a single complete line', () => {
  const framer = new LineFramer();
  const frames = framer.push(Buffer.from('HELLO\n'));

  assert.equal(frames.length, 1);
  assert.equal(frames[0]?.toString(), 'HELLO');
});

test('strips trailing \\r by default', () => {
  const framer = new LineFramer();
  const frames = framer.push(Buffer.from('HELLO\r\n'));

  assert.equal(frames[0]?.toString(), 'HELLO');
});

test('return no frames when a line is incomplete', () => {
  const framer = new LineFramer();
  const frames = framer.push(Buffer.from('PARTIAL'));

  assert.deepEqual(frames, []);
});

test('assembles a line split across two chunks', () => {
  const framer = new LineFramer();

  const firstResult = framer.push(Buffer.from('HEL'));
  assert.deepEqual(firstResult, []);

  const secondResult = framer.push(Buffer.from('LO\n'));
  assert.equal(secondResult.length, 1);
  assert.equal(secondResult[0]?.toString(), 'HELLO');
});

test('emits multiple lines delivered in a single chunk', () => {
  const framer = new LineFramer();
  const frames = framer.push(Buffer.from('ONE\nTWO\nTHREE\n'));

  assert.deepEqual(
    frames.map((f) => f.toString()),
    ['ONE', 'TWO', 'THREE'],
  );
});

test('keeps a trailing partial line buffered for the next push', () => {
  const framer = new LineFramer();

  const first = framer.push(Buffer.from('ONE\nTWO_STAR'));
  assert.deepEqual(
    first.map((f) => f.toString()),
    ['ONE'],
  );

  const second = framer.push(Buffer.from('T\n'));
  assert.deepEqual(
    second.map((f) => f.toString()),
    ['TWO_START'],
  );
});

test('supports a custom single-byte terminator', () => {
  const framer = new LineFramer({ terminator: 0x08 }); // \b
  const frames = framer.push(Buffer.from('PWR ON\b'));

  assert.equal(frames[0]?.toString(), 'PWR ON');
});

test('supports a custom multi-byte terminator', () => {
  const framer = new LineFramer({ terminator: [0x1b, 0x5c] }); // ESC \
  const frames = framer.push(Buffer.from([0x50, 0x57, 0x52, 0x1b, 0x5c])); // "PWR" + ESC \

  assert.equal(frames[0]?.toString(), 'PWR');
});

test('does not strip trailing \\r when \\r is itself the terminator', () => {
  const framer = new LineFramer({ terminator: 0x0d, stripTrailingCr: false });
  const frames = framer.push(Buffer.from('PWR ON\r'));

  assert.equal(frames[0]?.toString(), 'PWR ON');
});
