import net from 'net';
import { encodePacket } from './packet';
import { SmartBuffer } from './SmartBuffer';
import { publicEncrypt, randomBytes } from 'crypto';

const host = 'localhost';
const port = 25565;
const username = 'Bot';
const protocolVersionNumber = 758; // https://wiki.vg/Protocol#Handshaking

const socket = net.connect(port, host);

export const start = () => {
  socket.on('connect', () => {
    console.log('Connected');

    socket.on('data', readEncryptionResponse);
    socket.on('end', () => console.log('End'));
    socket.on('close', () => console.log('Close'));
    socket.on('error', () => console.log('Error'));
    socket.on('lookup', () => console.log('Lookup'));
    socket.on('ready', () => { // is this necessary listener?
      console.log('Ready');

      socket.write(createHandshakePacket());
      socket.write(createLoginPacket());
    });
  });
};

const readStatusResponse = (inputBuffer: Buffer) => {
  const buffer = SmartBuffer.fromBuffer(inputBuffer);
  const packetLength = buffer.readVarInt();
  const packetId = buffer.readVarInt();
  const responseLength = buffer.readVarInt();
  const response = buffer.readString('utf-8');

  console.log({
    packetLength,
    packetId,
    response: JSON.parse(response),
  });
};

const readEncryptionResponse = (inputBuffer: Buffer) => {
  console.log('Received something :)');

  const buffer = SmartBuffer.fromBuffer(inputBuffer);

  const packetLength = buffer.readVarInt();
  const packetId = buffer.readVarInt();

  console.log({
    packetLength,
    packetId,
  });

  if (packetId === 1) {
    const serverIdLength = buffer.readVarInt();
    const serverId = buffer.readBuffer(serverIdLength);
    const publicKeyLength = buffer.readVarInt();
    const publicKey = buffer.readBuffer(publicKeyLength);
    const verifyTokenLength = buffer.readVarInt();
    const verifyToken = buffer.readBuffer(verifyTokenLength);

    console.log({
      packetLength,
      packetId,
      serverIdLength,
      serverId,
      publicKeyLength,
      publicKey,
      publicKeyBase64: publicKey.toString('base64'),
      verifyTokenLength,
      verifyToken,
    });

    const publicKeyPEM = publicKeyDerToPem(publicKey);
    const sharedSecret = randomBytes(16);
    const encryptedSharedSecret = publicEncrypt(publicKeyPEM, sharedSecret);
    const encryptedVerifyToken = publicEncrypt(publicKeyPEM, verifyToken);

    socket.write(createEncryptionPacket(encryptedSharedSecret, encryptedVerifyToken));
  } else {
    console.log(`Packet id: ${packetId}. Skipping`);
  }
};

const createHandshakePacket = () => {
  const data = new SmartBuffer();

  // Protocol version (758) -  	VarInt
  data.writeVarInt(protocolVersionNumber);

  // Hostname -  	String
  data.writeVarInt(host.length);
  data.writeString(host, 'utf-8');

  // Port - Unsigned Short
  data.writeUInt16BE(port);

  // Next state (1 status, 2 login) - VarInt Enum
  data.writeVarInt(2);

  return encodePacket(0, data.toBuffer());
};

const createLoginPacket = () => {
  const data = new SmartBuffer();

  data.writeVarInt(username.length);
  data.writeString(username, 'utf-8');

  return encodePacket(0, data.toBuffer());
};

const createPingPacket = () => {
  const data = new SmartBuffer();

  return encodePacket(0, data.toBuffer());
};

const createEncryptionPacket = (sharedSecret: Buffer, verifyToken: Buffer) => {
  const data = new SmartBuffer();

  // @NOTE something is wrong and it doesn't work - minecraft server
  // returns protocol error

  data.writeVarInt(sharedSecret.length);
  data.writeBuffer(sharedSecret);
  data.writeVarInt(verifyToken.length);
  data.writeBuffer(verifyToken);

  return encodePacket(1, data.toBuffer());
};

const publicKeyDerToPem = (key: Buffer): string => {
  return [
    '-----BEGIN PUBLIC KEY-----',
    key.toString('base64'),
    '-----END PUBLIC KEY-----',
  ].join('\n');
};