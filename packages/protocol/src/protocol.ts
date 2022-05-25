import net from 'net';
import { PacketManager } from './packets/PacketManager';
import { Packet } from './packets/packet';
import { createHandshakePacket, createLoginPacket, StateId } from './states';
import { SmartBuffer } from './SmartBuffer';
import { Observable } from 'rxjs';

export interface ProtocolConfig {
  host: string;
  port: number;
  username: string;
  debug?: boolean;
}

export interface Protocol {
  name: string;
  uuid: string;
  send: (packet: Packet) => void;
  packets: Observable<Packet>;
}

export const protocol = (config: ProtocolConfig): Promise<Protocol> => new Promise(resolve => {
  const socket = net.connect(config.port, config.host);

  socket.on('connect', () => {
    console.log('Connected');

    const packetManager = new PacketManager(socket, config.debug ?? false);
    const handshakePacket = createHandshakePacket({
      host: config.host,
      port: config.port,
      protocolVersion: 758
    }, StateId.Login);
    const loginPacket = createLoginPacket(config.username);

    packetManager.send(handshakePacket);
    packetManager.send(loginPacket);

    const loginSubscription = packetManager.packets.subscribe({
      next: (packet) => {
        if (packet.id === 3) {
          const maxPacketSize = SmartBuffer.fromBuffer(packet.data).readVarInt();
        
          packetManager.setCompressionThreshold(maxPacketSize);
        }
        
        if (packet.id === 2) {
          const sb = SmartBuffer.fromBuffer(packet.data);
          const uuid = sb.readBuffer(16);
          const nickname = sb.readString(sb.readVarInt());

          loginSubscription.unsubscribe();
        
          resolve({
            name: nickname,
            uuid: uuid.toString('hex'),
            send: p => packetManager.send(p),
            packets: packetManager.packets,
          });
        }
      }
    })
  });
});