import { parseVarInt, parseBoolean, parseByte } from '../parsePacket'
import { EventSchema, IEvent } from './types';

interface Payload {
  id: number;
  yaw: number;
  pitch: number;
  onGround: boolean;
}

export class EntityRotationChangedEvent implements IEvent {
  public constructor (public readonly payload: Payload) {}

  public static readonly schema: EventSchema<Payload> = {
    id: parseVarInt(),
    yaw: parseByte(),
    pitch: parseByte(),
    onGround: parseBoolean(),
  }
}