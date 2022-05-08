import net from 'net';
import { StateManager } from './states/StateManager';
import { StateHandshake } from './states/StateHandshake';
import { StateLogin } from './states/StateLogin';
import { StatePlay } from './states/StatePlay';
import { PacketManager } from './packets/PacketManager';

export interface ProtocolConfig {
  host: string;
  port: number;
  playHandler: StatePlay;
  username: string;
}

export const protocol = (config: ProtocolConfig): Promise<StateManager> => new Promise(resolve => {
  const socket = net.connect(config.port, config.host);

  socket.on('connect', () => {
    console.log('Connected');

    const packetManager = new PacketManager(socket);
    const stateManager = new StateManager({
      states: [
        new StateHandshake(),
        new StateLogin({ username: config.username }),
        config.playHandler,
      ],
      packetManager,
    });

    resolve(stateManager);
  });
});