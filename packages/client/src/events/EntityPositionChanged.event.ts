import { Packet, parsePacketData, parseDouble, parseFloat, parseBuffer, parseVarInt, parseBoolean, parseUUID, parseInt, parseShort, parseByte } from 'protocol';
import { IEvent } from './types';

interface Payload {
  id: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
  onGround: boolean;
}

export class EntityPositionChangedEvent implements IEvent {
  private constructor (public readonly payload: Payload) {}

  public static async fromPacket(packet: Packet) {
    const [data] = await parsePacketData(packet.data, {
      id: parseVarInt(),
      deltaX: parseShort(),
      deltaY: parseShort(),
      deltaZ: parseShort(),
      onGround: parseBoolean(),
    });

    return new EntityPositionChangedEvent(data);
  }
}