# AVL Sandbox

A TypeScript framework for creating fake commercial A/V devices to use for plugin/driver development.

> **Early development**: AVL Sandbox's API may change before v1.0 is released

## Installation

`npm install avl-sandbox`

Requires Node 22 or later.

## Why AVL Sandbox?

I once needed to develop a plugin for a lighting control server that had its commands documented but not the server's responses. I wound up creating a small server I could run on my computer with a 1:1 compatible API so I didn't need to VPN into my workplace to turn the lights on and off from miles away while testing the Bitfocus Companion module I was writing.

It's not always practical to have a live device locally during driver development. AVL Sandbox lets you create a lightweight software representation of a device that can:

- Maintain internal state
- Define parameters
- Respond to commands locally or across the network via  UDP (TCP coming soonish)
- Behave like a real networked device from the perspective of your control system

## API

### Class MockDevice

The MockDevice class represents a simulated networked device.

**Example**

```ts
import { MockDevice } from "avl-sandbox"

// Creates a mock device using the supplied transport
const device = new MockDevice(transport)

// Define a piece of state for this device
device.defineState("power", false)
device.defineState("input", "HDMI1")

// Update an existing state value
device.setState("power", true)

// Get the current value of a state property
const power = device.getState<boolean>("power")

// Define a command the device can respond to
device.command("PWR ON", (device) => {
    device.setState("power", true)
    return "PWR ON"
})

// Start or stop the device and its transport
await device.start()
await device.stop()
```

**Constructor**

```ts
new MockDevice(transport: Transport): MockDevice
```

| Method | Description |
| --- | --- |
| `defineState(name, initialValue)` | Defines a state property |
| `setState(name, value)` | Updates a state property |
| `getState<T>(name)` | Gets a state property |
| `command(command, handler)` | Defines a command and response |
| `start()` | Starts the device and transport |
| `stop()` | Stops the device and transport |

The device owns its state and command definitions, while the transport handles network communication.

### UdpTransport

UdpTransport provides UDP network communication for a `MockDevice`.

**Example**

```ts
import { UdpTransport } from "avl-sandbox"

const transport = new UdpTransport({
    port: 4352
})
```

**Constructor**

```ts
new UdpTransport({ port: number }): UdpTransport
```

| Method | Description |
| --- | --- |
| `port` | Gets the transport's port |

## Example: A Mock Projector

```ts
import { MockDevice, UdpTransport } from "avl-sandbox";

const projector = new MockDevice(
    new UdpTransport({port: 4352})
)

projector.defineState("power", false)

projector.command("PWR ON", (device) => {
    device.setState("power", true)
    return "PWR ON"
})

projector.command("PWR OFF", (device) => {
    device.setState("power", false)
    return "PWR OFF"
})

projector.command("PWR?", (device) => {
    return device.getState<boolean>("power") ? "PWR ON" : "PWR OFF"
})

await projector.start()
console.log("Projector listening on UDP port 4352")
```

Run the script and try sending commands to `127.0.0.1:4352`.

## Parameterized Commands

Commands can include typed parameters using `{name:type}` syntax. Supported types are `string` and `number`. Matched values are parsed and passed to the handler as a `params` object.

> For booleans: use a string for "true" or "false" and a number for 1 or 0.

```ts
const mixer = new MockDevice(newUdpTransport({ port: 4353 }))

mixer.defineState("ch1_volume", 0)
mixer.defineState("ch2_volume", 0)

mixer.command("SET CH{channel:number} VOL {value:number}", (device, params) => {
    device.setState(`ch ${params.channel} volume`, params.value)
    return `OK CH${params.channel} VOL ${params.value}`
})

await mixer.start()
```

Sending "SET CH1 VOL -10" updates ch1_volume and replies "OK CH1 VOL -10".

If no defined command matches an incomming message, the device emits error event `NoCommandMatchedError`.

```ts
mixer.on("error", (error) => {
    console.error(error.message)
})
```

> **Note**: if multiple command patterns could match the same input, the first one registered wins.
