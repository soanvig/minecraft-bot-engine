import { SmartBuffer } from 'protocol';
import { parseBuffer, parseVarInt, parseInt, parseNBT, parseByteArray, parseIterate, parseObject, parseShort } from '../parsePacket';
import { times } from '../utils';
import { EventSchema, IEvent } from './types';

interface Payload {
  x: number;
  z: number;
  heightmaps: any; // nbt
  data: Buffer; // https://wiki.vg/Chunk_Format#Data_structure
  dataSections: any;

  // https://minecraft.fandom.com/wiki/Block_entity
  // Probably not needed
  // blockEntitiesCount: number;
  // blockEntities: any;

  // More fields contain only light information
  // which is irrelevant for us
}

/**
 * @NOTE in progress
 * 
 * notes:
 * 1. chunk height 384 or 256 probably (although see https://github.com/PrismarineJS/prismarine-chunk/blob/master/src/pc/1.18/ChunkColumn.js#L15)
 */
export class ChunkUpdatedEvent implements IEvent {
  public constructor (public readonly payload: Payload) {}

  public static readonly schema: EventSchema<Payload> = {
    x: parseInt(),
    z: parseInt(),
    heightmaps: parseNBT(),
    data: parseByteArray(),
    dataSections: (b: SmartBuffer, ctx: any) => {
      const data = SmartBuffer.fromBuffer(ctx.data);

      const blockCount = data.readInt16BE();
      const palleteBitsPerEntry = data.readUInt8();
      const paletteLength = data.readVarInt();
      const pallete = times(paletteLength, () => b.readVarInt());
      const dataArrayLength = data.readVarInt();
      const dataArray = times(dataArrayLength, () => data.readBigInt64BE());


      return {
        palleteBitsPerEntry,
        pallete,
        dataArray,
      };
    }
    // blockEntitiesCount: parseVarInt(),
    // blockEntities: (b: SmartBuffer, ctx: any) =>
    //   parseIterate(ctx.blockEntitiesCount, parseObject({
    //     xz: parseBuffer(1), // Split into to values
    //     y: parseShort(),
    //     type: parseVarInt(),
    //     data: parseNBT(),
    //   }))(b)
  };
}