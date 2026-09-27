# Parameterized Commands

Commands can include typed parameters using `{name:type}` syntax. Supported types are `string` and `number`. Matched values are parsed and passed to the handler as a `params` object.

> [!TIP]
> For booleans: use a string for "true" or "false" and a number for 1 or 0.

```ts
const mixer = new MockDevice(newUdpTransport({ port: 4353 }));

mixer.defineState('ch1_volume', 0);
mixer.defineState('ch2_volume', 0);

mixer.command('SET CH{channel:number} VOL {value:number}', (device, params) => {
  device.setState(`ch ${params.channel} volume`, params.value);
  return `OK CH${params.channel} VOL ${params.value}`;
});

await mixer.start();
```

Sending "SET CH1 VOL -10" updates ch1_volume and replies "OK CH1 VOL -10".

If no defined command matches an incomming message, the device emits error event `NoCommandMatchedError`.

```ts
mixer.on('error', (error) => {
  console.error(error.message);
});
```

> [!NOTE]
> If multiple command patterns could match the same input, the first one registered wins.
