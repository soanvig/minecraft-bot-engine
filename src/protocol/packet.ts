import { SmartBuffer } from './SmartBuffer';
import { inflateSync, unzipSync } from 'zlib';

/**
 * @TODO
 * 1. Extract to more declarative approach
 * 2. Use streams, not sync
 * 3. Optimize code with "insert" when length of following fields needs to be determined beforehand
 * (after https://github.com/JoshGlazebrook/smart-buffer/pull/47 is merged)
 * 4. Use Unzip for compressing the packet (currently not implemented, because it relies on streams)
 */

export interface Packet {
  id: number;
  length: number;
  data: SmartBuffer;
}

export const encodePacket = (id: number, data: Buffer): Buffer => {
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

export const encodeCompressedPacket = (compressionThreshold: number, id: number, data: Buffer): Buffer => {
  const packet = new SmartBuffer();
  const idLength = new SmartBuffer().writeVarInt(id).length;

  const dataToSend = new SmartBuffer();
  dataToSend.writeVarInt(id);
  dataToSend.writeBuffer(data);

  if (idLength + data.length < compressionThreshold) {
    packet.writeVarInt(dataToSend.length + 1); // 1 for dataLength encoded for 0
    packet.writeVarInt(0);
    packet.writeBuffer(dataToSend.toBuffer());
  } else {
    const compressedData = inflateSync(dataToSend.toBuffer());

    const dataLength = dataToSend.length;
    const dataLengthLength = new SmartBuffer().writeVarInt(dataLength).length;
    const compressedPacketLength = dataLengthLength + compressedData.length;
    
    packet.writeVarInt(compressedPacketLength);
    packet.writeVarInt(dataLength);
    packet.writeBuffer(compressedData);
  }

  return packet.toBuffer();
};