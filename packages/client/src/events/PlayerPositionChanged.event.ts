import { Packet } from 'protocol';
import { parsePacketData, parseDouble, parseFloat, parseBuffer, parseVarInt, parseBoolean } from '../parsePacket'
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

export class PlayerPositionChangedEvent implements IEvent {
  private constructor (public readonly payload: Payload) {}

  public static async fromPacket(packet: Packet) {
    const [data] = parsePacketData(packet.data, {
      x: parseDouble(),
      y: parseDouble(),
      z: parseDouble(),
      yaw: parseFloat(),
      pitch: parseFloat(),
      flags: parseBuffer(1),
      teleportId: parseVarInt(),
      shouldDismountVehicle: parseBoolean(),
    });

    return new PlayerPositionChangedEvent(data);
  }
}