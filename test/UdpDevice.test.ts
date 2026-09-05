import { test, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"

import { MockDevice } from "../src/MockDevice.js"
import { UdpTransport } from "../src/transport/UdpTransport.js"
import { sendUdp } from "./helpers/udpClient.js"

function createProjector() {
  const transport = new UdpTransport({
    port: 0
  });

  const projector = new MockDevice(transport);

  projector.defineState("power", false);

  projector.command("PWR ON", (device) => {
    device.setState("power", true);
    return "PWR ON";
  });

  projector.command("PWR OFF", (device) => {
    device.setState("power", false);
    return "PWR OFF";
  });

  return {
    projector,
    transport
  };
}

let projector: MockDevice
let transport: UdpTransport

beforeEach(async () => {
    ({ projector, transport } = createProjector())

    await projector.start()
})

afterEach(() => {
    projector.stop()
})

test("basic power on state send and check", async () => {
    const response = await sendUdp("PWR ON", transport.port)

    assert.equal(response, "PWR ON")
    assert.equal(projector.getState<boolean>("power"), true)
})