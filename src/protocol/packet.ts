import { SmartBuffer } from './SmartBuffer';
import { unzipSync } from 'zlib';

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

export const decodeCompressedPacket = (compressionThreshold: number, packet: Buffer): Packet => {
  const smartBuffer = SmartBuffer.fromBuffer(packet);

  const packetLength = smartBuffer.readVarInt();
  const dataLength = smartBuffer.readVarInt();

  if (dataLength < compressionThreshold) {
    const uncompressedId = smartBuffer.readVarInt();
    const uncompressedData = smartBuffer;

    return {
      id: uncompressedId,
      length: packetLength,
      data: SmartBuffer.fromBuffer(uncompressedData.readBuffer()),
    }
  }

  const compressedData = smartBuffer.readBuffer();
  const decompressedData = SmartBuffer.fromBuffer(unzipSync(compressedData));

  const id = decompressedData.readVarInt();
  const data = decompressedData;

  return {
    id,
    length: dataLength,
    data: SmartBuffer.fromBuffer(data.readBuffer()),
  };
};