import { Packet } from './packets/packet';
import { SmartBuffer } from './SmartBuffer';

export enum StateId {
  Handshake = 0,
  Login = 2,
  Play = 3,
}

interface HandshakeConfig {
  host: string;
  port: number;
  protocolVersion: number;
}

export const createHandshakePacket = (config: HandshakeConfig, targetState: number): Packet => {
  const data = new SmartBuffer();

  data.writeVarInt(config.protocolVersion);
  data.writeVarInt(config.host.length);
  data.writeString(config.host, 'utf-8');
  data.writeUInt16BE(config.port);
  data.writeVarInt(targetState);

  return {
    id: 0,
    data: data.toBuffer(),
  };
};

export const createLoginPacket = (username: string): Packet => {
  const data = new SmartBuffer();

  data.writeVarInt(username.length);
  data.writeString(username, 'utf-8');

  return {
    id: 0,
    data: data.toBuffer(),
  };
};
