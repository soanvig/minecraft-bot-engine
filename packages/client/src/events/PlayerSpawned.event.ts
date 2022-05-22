import { Packet } from 'protocol';
import { parsePacketData, parseDouble, parseVarInt, parseUUID, parseByte } from '../parsePacket'
import { IEvent } from './types';

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
  private constructor (public readonly payload: Payload) {}

  public static async fromPacket(packet: Packet) {
    const [data] = parsePacketData(packet.data, {
      id: parseVarInt(),
      uuid: parseUUID(),
      x: parseDouble(),
      y: parseDouble(),
      z: parseDouble(),
      yaw: parseByte(),
      pitch: parseByte(),
    });

    return new PlayerSpawnedEvent(data);
  }
}