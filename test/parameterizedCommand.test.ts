import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockDevice } from '../src/device/MockDevice.js';
import { UdpTransport } from '../src/transport/UdpTransport.js';
import { TestUdpClient } from './helpers/udpClient.js';

test('MockDevice correctly routes a parameterized command end to end', async () => {
  const transport = new UdpTransport({ port: 0 });
  const device = new MockDevice(transport);

  device.command('SET CH{channel:number} VOL {value:number}', (device, params) => {
    return `OK CH${params.channel} VOL ${params.value}`;
  });

  await device.start();
  const client = await TestUdpClient.connect(transport.port);

  client.send('SET CH3 VOL -20');
  const reply = await client.waitForMessage();

  assert.equal(reply, 'OK CH3 VOL -20');
  await device.stop();
  await client.close();
});
