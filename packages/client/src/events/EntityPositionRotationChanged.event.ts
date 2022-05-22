import { Packet } from 'protocol';
import { parsePacketData, parseVarInt, parseBoolean, parseShort, parseByte } from '../parsePacket';
import { IEvent } from './types';

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
  private constructor (public readonly payload: Payload) {}

  public static async fromPacket(packet: Packet) {
    const [data] = parsePacketData(packet.data, {
      id: parseVarInt(),
      deltaX: parseShort(),
      deltaY: parseShort(),
      deltaZ: parseShort(),
      yaw: parseByte(),
      pitch: parseByte(),
      onGround: parseBoolean(),
    });

    return new EntityPositionRotationChangedEvent(data);
  }
}