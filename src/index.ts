import { MockDevice } from "./MockDevice.js";
import { UdpTransport } from "./UdpTransport.js";

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