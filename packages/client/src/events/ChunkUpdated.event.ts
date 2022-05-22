import { SmartBuffer } from 'protocol';
import { parseBuffer, parseVarInt, parseInt, parseNBT, parseByteArray, parseIterate, parseObject, parseShort } from '../parsePacket';
import { EventSchema, IEvent } from './types';

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

/**
 * @NOTE in progress
 */
export class ChunkUpdatedEvent implements IEvent {
  public constructor (public readonly payload: Payload) {}

  public static readonly schema: EventSchema<Payload> = {
    x: parseInt(),
    z: parseInt(),
    heightmaps: parseNBT(),
    data: parseByteArray(),
    blockEntitiesCount: parseVarInt(),
    blockEntities: (b: SmartBuffer, ctx: any) =>
      parseIterate(ctx.blockEntitiesCount, parseObject({
        xz: parseBuffer(1), // Split into to values
        y: parseShort(),
        type: parseVarInt(),
        data: parseNBT(),
      }))(b)
  };
}