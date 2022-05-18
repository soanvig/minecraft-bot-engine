import { writeFileSync } from 'fs';
import { SmartBuffer } from 'smart-buffer';
import { promisify } from 'util';
import { gunzip as asyncGunzip } from 'zlib';
import { hasGzipHeader, times } from './utils';

const gunzip = promisify(asyncGunzip);

export enum NBTType {
  End = 0,
  Byte = 1,
  Short = 2,
  Int = 3,
  Long = 4,
  Float = 5,
  Double = 6,
  ByteArray = 7,
  String = 8,
  List = 9,
  Compound = 10,
  IntArray = 11,
  LongArray = 12,
}

/**
 * Based on
 * https://github.com/sjmulder/nbt-js/blob/master/nbt.js
 */ 
const parseModifiedUtf8 = (buffer: Buffer): string => {
  const codepoints = [];

  for (let i = 0; i < buffer.length; i += 1) {
    if ((buffer[i] & 0x80) === 0) {
      codepoints.push(buffer[i] & 0x7F);
    } else if (i+1 < buffer.length &&
          (buffer[i]   & 0xE0) === 0xC0 &&
          (buffer[i+1] & 0xC0) === 0x80) {
      codepoints.push(
        ((buffer[i]   & 0x1F) << 6) |
        ( buffer[i+1] & 0x3F));
    } else if (i+2 < buffer.length &&
          (buffer[i]   & 0xF0) === 0xE0 &&
          (buffer[i+1] & 0xC0) === 0x80 &&
          (buffer[i+2] & 0xC0) === 0x80) {
      codepoints.push(
        ((buffer[i]   & 0x0F) << 12) |
        ((buffer[i+1] & 0x3F) <<  6) |
        ( buffer[i+2] & 0x3F));
    } else if (i+3 < buffer.length &&
          (buffer[i]   & 0xF8) === 0xF0 &&
          (buffer[i+1] & 0xC0) === 0x80 &&
          (buffer[i+2] & 0xC0) === 0x80 &&
          (buffer[i+3] & 0xC0) === 0x80) {
      codepoints.push(
        ((buffer[i]   & 0x07) << 18) |
        ((buffer[i+1] & 0x3F) << 12) |
        ((buffer[i+2] & 0x3F) <<  6) |
        ( buffer[i+3] & 0x3F));
    }
  }

  return String.fromCharCode.apply(null, codepoints);
}

const parseType = (b: SmartBuffer, type: number): any => {
  switch (type) {
    case NBTType.Byte:
      return b.readInt8();
    case NBTType.Short:
      return b.readInt16BE();
    case NBTType.Int:
      return b.readInt32BE();
    case NBTType.Long:
      return b.readBigInt64BE();
    case NBTType.Float:
      return b.readFloatBE();
    case NBTType.Double:
      return b.readDoubleBE();
    case NBTType.ByteArray:
      return times(b.readInt32BE(), () => b.readInt8());
    case NBTType.String:
      const stringLength = b.readUInt16BE();
      const stringBuffer = b.readBuffer(stringLength);
      
      return parseModifiedUtf8(stringBuffer);
    case NBTType.List:
      const listType = b.readInt8();
      return times(b.readInt32BE(), () => ({
        type: listType,
        payload: parseType(b, listType)
      }));
    case NBTType.Compound:
      const compound = [];

      while (true) {
        const tag = parseNBT(b);

        if (tag.type === NBTType.End) {
          break;
        }

        compound.push(tag);
      }

      return compound;
    case NBTType.IntArray:
      return times(b.readInt32BE(), () => b.readInt32BE());
    case NBTType.LongArray:
      return times(b.readInt32BE(), () => b.readBigInt64BE());
  }
}

export type NBT =
  { type: NBTType.End }
  | { type: NBTType.Byte, name: string, payload: number }
  | { type: NBTType.Short, name: string, payload: number }
  | { type: NBTType.Int, name: string, payload: number }
  | { type: NBTType.Long, name: string, payload: BigInt }
  | { type: NBTType.Float, name: string, payload: number }
  | { type: NBTType.Double, name: string, payload: number }
  | { type: NBTType.ByteArray, name: string, payload: number[] }
  | { type: NBTType.String, name: string, payload: string }
  | { type: NBTType.List, name: string, payload: Omit<NBT, 'name'>[] }
  | { type: NBTType.Compound, name: string, payload: NBT[] }
  | { type: NBTType.IntArray, name: string, payload: number[] }
  | { type: NBTType.LongArray, name: string, payload: BigInt[] }

const parseNBT = (b: SmartBuffer): NBT => {
  const type = b.readUInt8();

  switch (type) {
    case 0:
      return {
        type,
      }
    default: 
      const name = parseType(b, NBTType.String)
    
      return {
        type,
        name,
        payload: parseType(b, type),
      }
  }
}

/**
 * @param buffer - Buffer or SmartBuffer. Warning - if it is SmartBuffer and it is compressed with gzip, the whole SmartBuffer will be read. Otherwise SmartBuffer's read offset will be forwared only as far as necessary.
 */
export const decodeNBT = (buffer: Buffer | SmartBuffer): NBT => {
  let b = buffer instanceof SmartBuffer
    ? buffer
    : SmartBuffer.fromBuffer(buffer);

  if (hasGzipHeader(b)) {
    /** @TODO @NOTE https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/src/datatypes/minecraft.js#L63 */
    throw new Error('NBT is compressed! We dont support that for now, because it drains the buffer');
    // b = SmartBuffer.fromBuffer(await gunzip(b.readBuffer()));
  }

  return parseNBT(b);
}