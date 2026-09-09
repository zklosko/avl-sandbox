/**
 * Working PJLink example. Only represents power state at the moment.
 */

import { MockDevice, TcpTransport } from 'avl-sandbox';

const transport = new TcpTransport({ port: 4352 });
const projector = new MockDevice(transport);

projector.defineState('power', false);

projector.command('%1POWR1', (device) => {
  device.setState('power', true);
  return 'ACK %1POWR1';
});

projector.command('%1POWR0', (device) => {
  device.setState('power', false);
  return 'ACK %1POWR0';
});

projector.command('%1POWR?', (device) => {
  return device.getState<boolean>('power') ? '%1POWR1' : '%1POWR0';
});

await projector.start();
console.log('Projector listening on UDP port 4352');
