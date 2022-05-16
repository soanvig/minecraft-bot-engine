import { Packet, parsePacket, parseDouble, parseFloat, parseBuffer, parseVarInt, parseBoolean, parseInt, parseNBT, parseByteArray } from 'protocol';
import { IEvent } from './types';

interface Payload {
  x: number;
  z: number;
  heightmaps: any; // nbt
  data: Buffer; // https://wiki.vg/Chunk_Format#Data_structure
  blockEntitiesCount: number;
  blockEntities: any;

  // More fields contain only light information
  // which is irrelevant for us
}

export class ChunkUpdatedEvent implements IEvent {
  private constructor (public readonly payload: Payload) {}

  public static async fromPacket(packet: Packet) {
    return new ChunkUpdatedEvent(await parsePacket(packet, {
      x: parseInt(),
      z: parseInt(),
      heightmaps: parseNBT(),
      data: parseByteArray(),
      blockEntitiesCount: parseVarInt(),
      blockEntities: parseBuffer(1), /** @TODO whatever for now */
    }));
  }
}