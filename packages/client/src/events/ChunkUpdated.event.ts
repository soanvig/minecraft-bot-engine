import { Packet, parsePacketData, parseDouble, parseFloat, parseBuffer, parseVarInt, parseBoolean, parseInt, parseNBT, parseByteArray, parseIterate, parseObject, parseShort } from 'protocol';
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
    const [firstPart, unparsedData] = await parsePacketData(packet.data, {
      x: parseInt(),
      z: parseInt(),
      heightmaps: parseNBT(),
      data: parseByteArray(),
      blockEntitiesCount: parseVarInt(),
    });

    const [secondPart] = await parsePacketData(unparsedData, {
      blockEntities: parseIterate(firstPart.blockEntitiesCount, parseObject({
        xz: parseBuffer(1), // Split into to values
        y: parseShort(),
        type: parseVarInt(),
        data: parseNBT(),
      }))
    })

    return new ChunkUpdatedEvent({
      ...firstPart,
      ...secondPart,
    });
  }
}