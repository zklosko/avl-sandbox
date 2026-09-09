import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DeviceState } from '../src/device/DeviceState.js';
import { UnknownStateError } from '../src/errors/UnknownStateError.js';
import { NotAGroupError } from '../src/errors/NotAGroupError.js';
import { IndexOutOfRangeError } from '../src/errors/IndexOutOfRangeError.js';

// Flat state
test('defines and retrieves flat state', () => {
  const state = new DeviceState();
  state.defineState('power', false);

  assert.equal(state.getState('power'), false);
});

test('setState updates an existing value', () => {
  const state = new DeviceState();
  state.defineState('power', false);
  state.setState('power', true);

  assert.equal(state.getState('power'), true);
});

test('getState throws UnknownStateError for an undefined name', () => {
  const state = new DeviceState();

  assert.throws(() => state.setState('nonexistent', 1), UnknownStateError);
});

// Single-level groups
test('group() creates the correct number of entries with template defaults', () => {
  const state = new DeviceState();
  state.group('channel', 4, { volume: 0, mute: false });

  for (let i = 0; i < 4; i++) {
    const channel = state.at('channel', 1);
    assert.equal(channel.getState('volume'), 0);
    assert.equal(channel.getState('mute'), false);
  }
});

test('setState on a group entry patches one field without affecting others', () => {
  const state = new DeviceState();
  state.group('channel', 2, { volume: 0, mute: false });

  state.at('channel', 2).setState('volume', -10);

  assert.equal(state.at('channel', 2).getState('volume'), -10);
  assert.equal(state.at('channel', 2).getState('mute'), false);
  assert.equal(state.at('channel', 1).getState('volume'), 0);
});

test("at() throws NotAGroupError when name isn't a defined group", () => {
  const state = new DeviceState();
  state.defineState('power', false);

  assert.throws(() => state.at('power', 0), NotAGroupError);
});

test('at() throws IndexOutOfRangeError for an out-of-range index', () => {
  const state = new DeviceState();
  state.group('channel', 4, { volume: 0 });

  assert.throws(() => state.at('channel', 5), IndexOutOfRangeError);
  assert.throws(() => state.at('channel', -1), IndexOutOfRangeError);
});

// Nested groups
test('group() with a builder function supports nested structure', () => {
  const state = new DeviceState();

  state.group('space', 2, (space) => {
    space.defineState('preset', 0);
    space.group('zone', 2, { power: false, level: 0 });
  });

  const space1 = state.at('space', 1);
  assert.equal(space1.getState('preset'), 0);

  const zone2 = space1.at('zone', 2);
  assert.equal(zone2.getState('power'), false);
});

test('nested group entries are independent across parent entries', () => {
  const state = new DeviceState();

  state.group('space', 2, (space) => {
    space.group('zone', 2, { power: false });
  });

  state.at('space', 1).at('zone', 1).setState('power', true);

  assert.equal(state.at('space', 1).at('zone', 1).getState('power'), true);
  assert.equal(state.at('space', 1).at('zone', 2).getState('power'), false); // sibling zone untouched
  assert.equal(state.at('space', 2).at('zone', 1).getState('power'), false); // sibling space untouched
});

test('nested at() throws IndexOutOfRangeError at the inner level', () => {
  const state = new DeviceState();
  state.group('space', 2, (space) => {
    space.group('zone', 3, { power: false });
  });

  assert.throws(() => state.at('space', 0).at('zone', 3), IndexOutOfRangeError);
});
