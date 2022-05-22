import { parseVarInt, parseBoolean, parseShort } from '../parsePacket'
import { EventSchema, IEvent } from './types';

interface Payload {
  id: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
  onGround: boolean;
}

export class EntityPositionChangedEvent implements IEvent {
  public constructor (public readonly payload: Payload) {}

  public static readonly schema: EventSchema<Payload> = {
    id: parseVarInt(),
    deltaX: parseShort(),
    deltaY: parseShort(),
    deltaZ: parseShort(),
    onGround: parseBoolean(),
  };
}