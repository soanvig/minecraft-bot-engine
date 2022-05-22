import { Packet } from 'protocol';
import { parseDouble, parseVarInt, parseUUID, parseByte } from '../parsePacket'
import { EventSchema, IEvent } from './types';

interface Payload {
  id: number;
  uuid: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

export class PlayerSpawnedEvent implements IEvent {
  public constructor (public readonly payload: Payload) {}

  public static readonly schema: EventSchema<Payload> = {
    id: parseVarInt(),
    uuid: parseUUID(),
    x: parseDouble(),
    y: parseDouble(),
    z: parseDouble(),
    yaw: parseByte(),
    pitch: parseByte(),
  }
}