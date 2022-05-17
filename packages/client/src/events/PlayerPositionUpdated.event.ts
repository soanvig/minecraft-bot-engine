import { Packet, parsePacketData, parseDouble, parseFloat, parseBuffer, parseVarInt, parseBoolean } from 'protocol';
import { IEvent } from './types';

interface Payload {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  flags: Buffer;
  teleportId: number;
  shouldDismountVehicle: boolean;
}

export class PlayerPositionUpdatedEvent implements IEvent {
  private constructor (public readonly payload: Payload) {}

  public static async fromPacket(packet: Packet) {
    const [data] = await parsePacketData(packet.data, {
      x: parseDouble(),
      y: parseDouble(),
      z: parseDouble(),
      yaw: parseFloat(),
      pitch: parseFloat(),
      flags: parseBuffer(1),
      teleportId: parseVarInt(),
      shouldDismountVehicle: parseBoolean(),
    });

    return new PlayerPositionUpdatedEvent(data);
  }
}