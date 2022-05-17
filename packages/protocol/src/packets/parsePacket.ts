import { SmartBuffer } from '../SmartBuffer';
import { decodeNBT } from 'nbt';
import { times } from './utils';

type Parser<T> = (b: SmartBuffer) => T | Promise<T>;
type PromiseResult<T> = T extends Promise<infer R> ? R : T;
type SchemaParserResult<P extends Parser<any>, T extends Record<string, P>> = {
  [K in keyof T]: PromiseResult<ReturnType<T[K]>>;
}

export const parsePacketData = async <P extends Parser<any>, T extends Record<string, P>>(
  packet: Buffer,
  schema: T
): Promise<[SchemaParserResult<P, T>, Buffer]> => {
  const smartBuffer = SmartBuffer.fromBuffer(packet);

  const parsed = await parseObject(schema)(smartBuffer);
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

export const parseBoolean =
  () =>
  (b: SmartBuffer) => Boolean(b.readBuffer(1)[0]);

export const parseNBT =
  () =>
  async (b: SmartBuffer) => await decodeNBT(b);

export const parseObject =
  <P extends Parser<any>,
  T extends Record<string, P>>(schema: T) =>
  async (b: SmartBuffer): Promise<SchemaParserResult<P, T>> => {
    const result = {} as SchemaParserResult<P, T>;

    for (const prop in schema) {
      const parser = schema[prop];

      result[prop] = await parser(b);
    }

    return result;
  }

export const parseIterate =
  <T>(n: number, parser: (b: SmartBuffer) => T) =>
  async (b: SmartBuffer): Promise<T[]> => {
    return await times(n, () => parser(b));
  }