import { parseDouble, parseVarInt, parseUUID, parseShort, parseByte } from '../parsePacket';
import { EventSchema, IEvent } from './types';

interface Payload {
  id: number;
  uuid: string;
  type: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  headYaw: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
}

export class LivingEntitySpawnedEvent implements IEvent {
  public constructor (public readonly payload: Payload) {}

  public static readonly schema: EventSchema<Payload> = {
    id: parseVarInt(),
    uuid: parseUUID(),
    type: parseVarInt(),
    x: parseDouble(),
    y: parseDouble(),
    z: parseDouble(),
    yaw: parseByte(),
    pitch: parseByte(),
    headYaw: parseByte(),
    velocityX: parseShort(),
    velocityY: parseShort(),
    velocityZ: parseShort(),
  };
}