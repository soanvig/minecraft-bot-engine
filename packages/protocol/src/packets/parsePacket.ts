import { SmartBuffer } from '../SmartBuffer';
import { Packet } from './packet';
import { decodeNBT } from 'nbt';
import { times } from './utils';

type Parser<T> = (b: SmartBuffer) => T | Promise<T>;
type PromiseResult<T> = T extends Promise<infer R> ? R : T;
type SchemaParserResult<P extends Parser<any>, T extends Record<string, P>> = {
  [K in keyof T]: PromiseResult<ReturnType<T[K]>>;
};

export const parsePacket = async <P extends Parser<any>, T extends Record<string, P>>(
  packet: Packet,
  schema: T
): Promise<SchemaParserResult<P, T>> => {
  const smartBuffer = SmartBuffer.fromBuffer(packet.data);

  return parseObject(schema)(smartBuffer);
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

export const parseBoolean =
  () =>
  (b: SmartBuffer) => Boolean(b.readBuffer(1)[0]);

export const parseNBT =
  () =>
  (b: SmartBuffer) => decodeNBT(b);

export const parseInt =
  () =>
  (b: SmartBuffer) => b.readInt32BE();

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
  (b: SmartBuffer): T[] => {
    return times(n, () => parser(b));
  }