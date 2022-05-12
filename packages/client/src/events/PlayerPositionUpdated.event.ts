import { Packet, parsePacket, parseDouble, parseFloat, parseBuffer, parseVarInt, parseBoolean } from 'protocol';
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
  public readonly payload: Payload;

  constructor (packet: Packet) {
    this.payload = parsePacket(packet, {
      x: parseDouble(),
      y: parseDouble(),
      z: parseDouble(),
      yaw: parseFloat(),
      pitch: parseFloat(),
      flags: parseBuffer(1),
      teleportId: parseVarInt(),
      shouldDismountVehicle: parseBoolean(),
    })
  }
}