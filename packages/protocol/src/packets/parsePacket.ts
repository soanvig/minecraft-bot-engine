import { SmartBuffer } from '../SmartBuffer';
import { decodeNBT } from 'nbt';
import { times } from './utils';

/** @TODO add typing to ctx */
type Parser<T> = (b: SmartBuffer, ctx: any) => T;
type SchemaParserResult<P extends Parser<any>, T extends Record<string, P>> = {
  [K in keyof T]: ReturnType<T[K]>;
}

export const parsePacketData = <P extends Parser<any>, T extends Record<string, P>>(
  packet: Buffer,
  schema: T
): [SchemaParserResult<P, T>, Buffer] => {
  const smartBuffer = SmartBuffer.fromBuffer(packet);

  const parsed = parseObject(schema)(smartBuffer, {});
  const unparsed = smartBuffer.readBuffer();

  return [parsed, unparsed];
}

export const parseVarInt =
  () =>
  (b: SmartBuffer) => b.readVarInt();

export const parseString =
  () =>
  (b: SmartBuffer) => {
    const length = b.readVarInt();

    return b.readString(length, 'utf-8');
  };

export const parseUUID =
  () =>
  (b: SmartBuffer) => b.readBuffer(16).toString('hex');

export const parseByteArray =
  () =>
  (b: SmartBuffer) => {
    const length = b.readVarInt();

    return b.readBuffer(length);
  };

export const parseBuffer =
  (length: number) =>
  (b: SmartBuffer) => b.readBuffer(length);

export const parseFloat =
  () =>
  (b: SmartBuffer) => b.readFloatBE();

export const parseDouble =
  () =>
  (b: SmartBuffer) => b.readDoubleBE();

export const parseShort =
  () =>
  (b: SmartBuffer) => b.readInt16BE();

export const parseInt =
  () =>
  (b: SmartBuffer) => b.readInt32BE();

export const parseByte =
  () =>
  (b: SmartBuffer) => b.readUInt8();

export const parseBoolean =
  () =>
  (b: SmartBuffer) => Boolean(b.readBuffer(1)[0]);

export const parseNBT =
  () =>
   (b: SmartBuffer) => decodeNBT(b);

export const parseObject =
  <P extends Parser<any>,
  T extends Record<string, P>>(schema: T) => 
   (b: SmartBuffer, ctx: any): SchemaParserResult<P, T> => {
    const result = {} as SchemaParserResult<P, T>;

    for (const prop in schema) {
      const parser = schema[prop];

      result[prop] = parser(b, result);
    }

    return result;
  }

export const parseIterate =
  <T>(n: number, parser: (b: SmartBuffer, ctx: any) => T) =>
   (b: SmartBuffer): T[] => {
    return times(n, () => parser(b, {}));
  }