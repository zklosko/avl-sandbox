# Grouped State

Some devices have many identically-shaped pieces of state — channels on a
mixer, zones on a controller — where defining each one by hand
(`ch1_volume`, `ch2_volume`, ...) isn't practical. `group()` defines a
fixed-size collection of state in one call, and `at()` gets you a handle to
one specific entry, with the same `getState`/`setState` API you already know.

> [!IMPORTANT]
> Indices are **1-based**, matching how real devices and their documentation usually number channels/zones (`CH1`, not `CH0`).

```ts
const mixer = new MockDevice(new UdpTransport({ port: 4353 }));

mixer.group('channel', 32, { volume: 0, mute: false });

mixer.command('SET CH{channel:number} VOL {value:number}', (device, params) => {
  device.at('channel', params.channel).setState('volume', params.value);
  return `OK CH${params.channel} VOL ${params.value}`;
});

await mixer.start();
// "SET CH1 VOL -10" sets channel 1's volume and replies "OK CH1 VOL -10"
```

## Nested groups

Groups can be nested arbitrarily deep by passing a builder function instead
of a plain object as the template. The builder receives a container for that
entry, which supports the same full API — including defining its own
sub-groups.

```ts
const echo = new MockDevice(new UdpTransport({ port: 4352 }));

echo.group('space', 16, (space) => {
  space.defineState('preset', 0);
  space.group('zone', 16, { power: false, level: 0 });
  space.group('sequence', 4, { running: false });
});

// Reach any level by chaining at():
echo.at('space', 2).at('zone', 3).setState('power', true);
const preset = echo.at('space', 2).getState('preset');
```

## Errors

Accessing a group incorrectly throws a specific, catchable error:

- `NotAGroupError` — `at()` was called on a name that isn't a defined group
- `IndexOutOfRangeError` — the index passed to `at()` is outside the group's
  defined size
- `UnknownStateError` — `getState`/`setState` was called with a name that
  was never defined via `defineState`

```ts
try {
  echo.at('space', 99);
} catch (err) {
  if (err instanceof IndexOutOfRangeError) {
    console.error(err.message); // "Index 99 is out of range for group 'space' (valid range: 1-16)"
  }
}
```
