import { parseVarInt, parseBoolean, parseShort, parseByte } from '../parsePacket';
import { EventSchema, IEvent } from './types';

interface Payload {
  id: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
  yaw: number;
  pitch: number;
  onGround: boolean;
}

export class EntityPositionRotationChangedEvent implements IEvent {
  public constructor (public readonly payload: Payload) {}

  public static readonly schema: EventSchema<Payload> = {
    id: parseVarInt(),
    deltaX: parseShort(),
    deltaY: parseShort(),
    deltaZ: parseShort(),
    yaw: parseByte(),
    pitch: parseByte(),
    onGround: parseBoolean(),
  }
}