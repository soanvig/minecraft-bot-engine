import { Packet, parsePacketData, parseDouble, parseFloat, parseBuffer, parseVarInt, parseBoolean, parseUUID, parseInt, parseShort, parseByte } from 'protocol';
import { IEvent } from './types';

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
  private constructor (public readonly payload: Payload) {}

  public static async fromPacket(packet: Packet) {
    const [data] = await parsePacketData(packet.data, {
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
    });

    return new LivingEntitySpawnedEvent(data);
  }
}