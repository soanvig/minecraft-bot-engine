import net from 'net';
import { StateManager } from './states/StateManager';
import { StateHandshake } from './states/StateHandshake';
import { StateLogin } from './states/StateLogin';
import { StatePlay } from './states/StatePlay';
import { PacketManager } from './packets/PacketManager';

const host = 'localhost';
const port = 25565;

export const start = () => {
  const socket = net.connect(port, host);

  socket.on('connect', () => {
    console.log('Connected');

    const packetManager = new PacketManager(socket);
    const stateManager = new StateManager({
      states: [
        new StateHandshake(),
        new StateLogin(),
        new StatePlay(),
      ],
      packetManager,
    });
  });
};