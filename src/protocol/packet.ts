import { SmartBuffer } from './SmartBuffer';

export interface Packet {
  id: number;
  length: number;
  data: SmartBuffer;
}

export const encodePacket = (id: number, data: Buffer) => {
  const idField = new SmartBuffer();
  idField.writeVarInt(id);

  const lengthField = new SmartBuffer();
  lengthField.writeVarInt(data.length + idField.length);

  return Buffer.concat([
    lengthField.toBuffer(),
    idField.toBuffer(),
    data,
  ]);
};

export const decodePacket = (packet: Buffer): Packet => {
  const smartBuffer = SmartBuffer.fromBuffer(packet);

  const length = smartBuffer.readVarInt();
  const id = smartBuffer.readVarInt();
  const data = smartBuffer;

  return {
    id,
    length,
    data: SmartBuffer.fromBuffer(data.readBuffer()),
  };
};