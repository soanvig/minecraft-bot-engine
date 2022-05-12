import { Packet, StatePlay, protocol, parsePacket, parseDouble, parseFloat, parseBuffer, parseVarInt, parseBoolean } from 'protocol';

class Play extends StatePlay {
  public receive (packet: Packet): void {
    if (packet.id === 0x38) {
      console.log(parsePacket(packet, {
        x: parseDouble(),
        y: parseDouble(),
        z: parseDouble(),
        yaw: parseFloat(),
        pitch: parseFloat(),
        flags: parseBuffer(1),
        teleportId: parseVarInt(),
        shouldDismountVehicle: parseBoolean(),
      }));
    }

    console.log(packet.id);
  }

  public onSwitchTo (): void {}
}

protocol({
  host: 'localhost',
  port: 25565,
  username: 'Bot2',
  playHandler: new Play(),
});
