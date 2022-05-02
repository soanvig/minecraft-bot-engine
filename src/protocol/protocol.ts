import net from 'net';
import { decodeCompressedPacket, decodePacket, encodePacket } from './packet';
import { StateManager } from './states/StateManager';
import { StateHandshake } from './states/StateHandshake';
import { StateLogin } from './states/StateLogin';
import { StatePlay } from './states/StatePlay';

const host = 'localhost';
const port = 25565;
let compressionThreshold = 0;

export const start = () => {
  const socket = net.connect(port, host);

  socket.on('connect', () => {
    console.log('Connected');

    socket.on('end', () => console.log('End'));
    socket.on('close', () => console.log('Close'));
    socket.on('error', () => console.log('Error'));
    socket.on('lookup', () => console.log('Lookup'));
    socket.on('ready', () => { // is this necessary listener?
      console.log('Ready');

      const stateManager = new StateManager({
        states: [
          new StateHandshake(),
          new StateLogin(),
          new StatePlay(),
        ],
        onSend: (id, data) => {
          const packet = encodePacket(id, data);

          socket.write(packet);
        },
        enableCompression: (threshold) => {
          compressionThreshold = threshold;
        }
      });

      socket.on('data', data => {
        if (compressionThreshold <= 0) {
          const packet = decodePacket(data);
          stateManager.receive(packet);
        } else {
          const packet = decodeCompressedPacket(compressionThreshold, data);
          stateManager.receive(packet);
        }
      });
    });
  });
};