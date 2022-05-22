import { parseDouble, parseFloat, parseBuffer, parseVarInt, parseBoolean } from '../parsePacket'
import { EventSchema, IEvent } from './types';

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
  public constructor (public readonly payload: Payload) {}

  public static readonly schema: EventSchema<Payload> = {
    x: parseDouble(),
    y: parseDouble(),
    z: parseDouble(),
    yaw: parseFloat(),
    pitch: parseFloat(),
    flags: parseBuffer(1),
    teleportId: parseVarInt(),
    shouldDismountVehicle: parseBoolean(),
  }
}