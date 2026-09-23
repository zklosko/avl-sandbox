// test/delimiterFramer.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DelimiterFramer } from '../src/protocol/DelimiterFramer.js';

const STX = 0x02;
const ETX = 0x03;

test('extracts content between start and end markers', () => {
  const framer = new DelimiterFramer({ start: STX, end: ETX });
  const frames = framer.push(Buffer.from([STX, ...Buffer.from('PWR ON'), ETX]));

  assert.equal(frames.length, 1);
  assert.equal(frames[0]?.toString(), 'PWR ON');
});

test('discards noise before the start marker', () => {
  const framer = new DelimiterFramer({ start: STX, end: ETX });
  const frames = framer.push(Buffer.from([0xff, 0xff, STX, ...Buffer.from('OK'), ETX]));

  assert.equal(frames[0]?.toString(), 'OK');
});

test('waits for the end marker across multiple chunks', () => {
  const framer = new DelimiterFramer({ start: STX, end: ETX });

  const first = framer.push(Buffer.from([STX, ...Buffer.from('PW')]));
  assert.deepEqual(first, []);

  const second = framer.push(Buffer.from([...Buffer.from('R ON'), ETX]));
  assert.equal(second.length, 1);
  assert.equal(second[0]?.toString(), 'PWR ON');
});

test('emits multiple frames delivered in one chunk', () => {
  const framer = new DelimiterFramer({ start: STX, end: ETX });
  const data = Buffer.concat([
    Buffer.from([STX, ...Buffer.from('ONE'), ETX]),
    Buffer.from([STX, ...Buffer.from('TWO'), ETX]),
  ]);

  const frames = framer.push(data);
  assert.deepEqual(
    frames.map((f) => f.toString()),
    ['ONE', 'TWO'],
  );
});

test('includeDelimiters keeps the markers in the emitted frame', () => {
  const framer = new DelimiterFramer({ start: STX, end: ETX, includeDelimiters: true });
  const frames = framer.push(Buffer.from([STX, ...Buffer.from('OK'), ETX]));

  assert.deepEqual(frames[0], Buffer.from([STX, ...Buffer.from('OK'), ETX]));
});

test('supports multi-byte start/end markers', () => {
  const framer = new DelimiterFramer({ start: [0x1b, 0x5b], end: [0x1b, 0x5d] });
  const frames = framer.push(Buffer.from([0x1b, 0x5b, ...Buffer.from('DATA'), 0x1b, 0x5d]));

  assert.equal(frames[0]?.toString(), 'DATA');
});
