import { SmartBuffer } from '../SmartBuffer';
import { deflate, inflate } from 'zlib';
import { promisify } from 'util';

/**
 * @TODO
 * 1. Probably responsibilites of these function needs to be limited, especially managing smart buffers
 * 3. Optimize code with "insert" when length of following fields needs to be determined beforehand
 * (after https://github.com/JoshGlazebrook/smart-buffer/pull/47 is merged)
 */

export interface Packet {
  id: number;
  data: SmartBuffer;
}

export const encodePacket = async ({ id, data }: Packet): Promise<Buffer> => {
  const idField = new SmartBuffer();
  idField.writeVarInt(id);

  const lengthField = new SmartBuffer();
  lengthField.writeVarInt(data.length + idField.length);

  return Buffer.concat([
    lengthField.toBuffer(),
    idField.toBuffer(),
    data.toBuffer(),
  ]);
};

export const decodePacket = async (packet: Buffer): Promise<Packet> => {
  const smartBuffer = SmartBuffer.fromBuffer(packet);

  const length = smartBuffer.readVarInt();
  const id = smartBuffer.readVarInt();
  const data = smartBuffer;

  return {
    id,
    data: SmartBuffer.fromBuffer(data.readBuffer()),
  };
};

export const decodeCompressedPacket = async (compressionThreshold: number, packet: Buffer): Promise<Packet> => {
  const smartBuffer = SmartBuffer.fromBuffer(packet);

  const packetLength = smartBuffer.readVarInt();
  const dataLength = smartBuffer.readVarInt();

  if (dataLength < compressionThreshold) {
    const uncompressedId = smartBuffer.readVarInt();
    const uncompressedData = smartBuffer;

    return {
      id: uncompressedId,
      data: SmartBuffer.fromBuffer(uncompressedData.readBuffer()),
    }
  }

  const compressedData = smartBuffer.readBuffer();
  const unzippedData = await promisify(inflate)(compressedData);
  const decompressedData = SmartBuffer.fromBuffer(unzippedData);

  const id = decompressedData.readVarInt();
  const data = decompressedData;

  return {
    id,
    data: SmartBuffer.fromBuffer(data.readBuffer()),
  };
};

export const encodeCompressedPacket = async (compressionThreshold: number, { id, data }: Packet): Promise<Buffer> => {
  const packet = new SmartBuffer();
  const idLength = new SmartBuffer().writeVarInt(id).length;

  const dataToSend = new SmartBuffer();
  dataToSend.writeVarInt(id);
  dataToSend.writeBuffer(data.toBuffer());

  if (idLength + data.length < compressionThreshold) {
    packet.writeVarInt(dataToSend.length + 1); // 1 for dataLength encoded for 0
    packet.writeVarInt(0);
    packet.writeBuffer(dataToSend.toBuffer());
  } else {
    const compressedData = await promisify(deflate)(dataToSend.toBuffer());

    const dataLength = dataToSend.length;
    const dataLengthLength = new SmartBuffer().writeVarInt(dataLength).length;
    const compressedPacketLength = dataLengthLength + compressedData.length;
    
    packet.writeVarInt(compressedPacketLength);
    packet.writeVarInt(dataLength);
    packet.writeBuffer(compressedData);
  }

  return packet.toBuffer();
};