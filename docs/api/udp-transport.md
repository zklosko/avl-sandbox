# UdpTransport

UdpTransport provides UDP network communication for a `MockDevice`.

## Example

```ts
import { UdpTransport } from 'avl-sandbox';

const transport = new UdpTransport({
  port: 4352,
});
```

## Constructor

```ts
new UdpTransport({ port: number }): UdpTransport
```

| Method | Description               |
| ------ | ------------------------- |
| `port` | Gets the transport's port |
