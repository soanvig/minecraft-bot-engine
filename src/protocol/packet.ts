import { SmartBuffer } from './SmartBuffer';

export const buildPacket = (id: number, data: Buffer) => {
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