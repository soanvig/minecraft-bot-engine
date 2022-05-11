import { SmartBuffer } from '../SmartBuffer';
import { Packet } from './packet';

export const parsePacket = <P extends (b: SmartBuffer) => any, T extends Record<string, P>>(
  packet: Packet,
  schema: T
): { [K in keyof T]: ReturnType<T[K]> } => {
  const smartBuffer = SmartBuffer.fromBuffer(packet.data);

  const result = {} as { [K in keyof T]: ReturnType<T[K]> };

  for (const prop in schema) {
    const parser = schema[prop];

    result[prop] = parser(smartBuffer);
  }

  return result;
}

export const parseVarInt = () => (b: SmartBuffer) => b.readVarInt();
export const parseString = () => (b: SmartBuffer) => {
  const length = b.readVarInt();

  return b.readString(length, 'utf-8');
};
export const parseBuffer = (length: number) => (b: SmartBuffer) => b.readBuffer(length);
export const parseFloat = () => (b: SmartBuffer) => b.readFloatBE();
export const parseDouble = () => (b: SmartBuffer) => b.readDoubleBE();
export const parseBoolean = () => (b: SmartBuffer) => Boolean(b.readBuffer(1)[0]);
