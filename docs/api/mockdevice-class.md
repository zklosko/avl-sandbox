# Class MockDevice

The MockDevice class represents a simulated networked device.

## Example

```ts
import { MockDevice } from 'avl-sandbox';

// Creates a mock device using the supplied transport
const device = new MockDevice(transport);

// Define a piece of state for this device
device.defineState('power', false);
device.defineState('input', 'HDMI1');

// Update an existing state value
device.setState('power', true);

// Get the current value of a state property
const power = device.getState<boolean>('power');

// Define a command the device can respond to
device.command('PWR ON', (device) => {
  device.setState('power', true);
  return 'PWR ON';
});

// Start or stop the device and its transport
await device.start();
await device.stop();
```

## Constructor

```ts
new MockDevice(transport: Transport): MockDevice
```

| Method                             | Description                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `defineState(name, initialValue)`  | Defines a state property                                                           |
| `setState(name, value)`            | Updates a state property                                                           |
| `getState<T>(name)`                | Gets a state property                                                              |
| `group(name, count, { template })` | Creates a group of state with the same properties (good for channels, zones, etc.) |
| `at(name, index)`                  | Gets an individual state from a group                                              |
| `command(command, handler)`        | Defines a command and response                                                     |
| `start()`                          | Starts the device and transport                                                    |
| `stop()`                           | Stops the device and transport                                                     |

The device owns its state and command definitions, while the transport handles network communication.
