import { Packet, parsePacketData, parseDouble, parseFloat, parseBuffer, parseVarInt, parseBoolean, parseUUID, parseInt, parseShort, parseByte } from 'protocol';
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