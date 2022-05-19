import net from 'net';
import { SmartBuffer, Packet, parsePacketData, parseVarInt } from '.';
import { decodeCompressedPacket, decodePacket, encodeCompressedPacket, encodePacket } from './packets/packet';

const socket = net.connect(25565, 'localhost');
const host = 'localhost';
const port = 25565;

socket.setNoDelay(true);

socket.on('connect', async () => {
  console.log('Connected');
  
  let decoder = decodePacket;
  let encoder = encodePacket;

  let handler = async (p: Packet) => {
    if (p.id === 3) {
      const [{ maxPacketSize }] = parsePacketData(p.data, {
        maxPacketSize: parseVarInt(),
      })

      encoder = encodeCompressedPacket(maxPacketSize);
      decoder = decodeCompressedPacket(maxPacketSize);
    }

    if (p.id === 2) {
      setTimeout(async () => socket.write(await encoder(createClientStatusPacket())), 5000);
      setTimeout(async () => {
        socket.write(await encoder(createClientSettingsPacket()));
        console.log('ready')
      }, 6000);
      handler = async (p: Packet) => {
        if (p.id === 0x36) {
          console.log(p);
        }
      }
    }
  }

  socket.on('data', async (d) => {
    const packet = await decoder(d);
    handler(packet);
  })

  const packet = createHandshakePacket(2);

  socket.write(await encoder(packet));
  socket.write(await encoder(createLoginPacket('tester')));
});

const createHandshakePacket = (targetState: number): Packet => {
  const data = new SmartBuffer();

  data.writeVarInt(758);
  data.writeVarInt(host.length);
  data.writeString(host, 'utf-8');
  data.writeUInt16BE(port);
  data.writeVarInt(targetState);

  return {
    id: 0,
    data: data.toBuffer(),
  };
};

const createLoginPacket = (username: string): Packet => {
  const data = new SmartBuffer();

  data.writeVarInt(username.length);
  data.writeString(username, 'utf-8');

  return {
    id: 0,
    data: data.toBuffer(),
  };
};

const createClientStatusPacket = (): Packet => {
  const data = new SmartBuffer();

  data.writeVarInt(0);

  return {
    id: 0x04,
    data: data.toBuffer(),
  };
};

const createClientSettingsPacket = (): Packet => {
  const data = new SmartBuffer();
  const locale = 'en_GB';

  data.writeVarInt(locale.length);
  data.writeString(locale, 'utf-8');
  data.writeUInt8(32);
  data.writeVarInt(0);
  data.writeUInt8(0);
  data.writeUInt8(0);
  data.writeVarInt(1);
  data.writeUInt8(0);
  data.writeUInt8(0);

  return {
    id: 0x05 ,
    data: data.toBuffer(),
  };
};