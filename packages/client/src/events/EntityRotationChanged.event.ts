import { Packet, parsePacketData, parseDouble, parseFloat, parseBuffer, parseVarInt, parseBoolean, parseUUID, parseInt, parseShort, parseByte } from 'protocol';
import { IEvent } from './types';

interface Payload {
  id: number;
  yaw: number;
  pitch: number;
  onGround: boolean;
}

export class EntityRotationChangedEvent implements IEvent {
  private constructor (public readonly payload: Payload) {}

  public static async fromPacket(packet: Packet) {
    const [data] = await parsePacketData(packet.data, {
      id: parseVarInt(),
      yaw: parseByte(),
      pitch: parseByte(),
      onGround: parseBoolean(),
    });

    return new EntityRotationChangedEvent(data);
  }
}