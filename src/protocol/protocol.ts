import net from 'net';
import { buildPacket } from './packet';
import { SmartBuffer } from './SmartBuffer';

const host = 'localhost';
const port = 51114;
const username = 'Bot';
const protocolVersionNumber = 758; // https://wiki.vg/Protocol#Handshaking

export const start = () => {
  const socket = net.connect(port, host);
  socket.on('connect', () => {
    console.log('Connected');

    socket.on('data', console.log);
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

const readEncryptionRequest = (inputBuffer: Buffer) => {
  // const { value: length, rest: restA } = decodeVarInt(inputBuffer);
  // const { value: packetId, rest: restB } = decodeVarInt(restA);
};

console.log(new SmartBuffer().writeVarInt(128).toBuffer());

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

  return buildPacket(0, data.toBuffer());
};

const createLoginPacket = () => {
  const data = new SmartBuffer();

  data.writeVarInt(username.length);
  data.writeString(username, 'utf-8');

  return buildPacket(0, data.toBuffer());
};

