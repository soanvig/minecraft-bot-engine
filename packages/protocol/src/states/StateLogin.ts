import { Packet } from '../packets/packet';
import { SmartBuffer } from '../SmartBuffer';
import { State, StateId } from './State';

interface LoginConfig {
  username: string;
}

export class StateLogin extends State {
  public readonly id = StateId.Login;

  constructor (
    private config: LoginConfig,
  ) {
    super();
  }

  public async receive (packet: Packet): Promise<void> {
    if (packet.id === 3) {
      const maxPacketSize = SmartBuffer.fromBuffer(packet.data).readVarInt();

      this.enableCompression(maxPacketSize);
    }

    if (packet.id === 2) {
      const sb = SmartBuffer.fromBuffer(packet.data);
      const uuid = sb.readBuffer(16);
      const nickname = sb.readString(sb.readVarInt());

      console.log('Login uuid', uuid.toString('hex'));
      console.log('Login nickname', nickname);

      this.switchTo(StateId.Play);
    }
  }

  public async onSwitchTo (): Promise<void> {
    this.send(createLoginPacket(this.config.username));
  }
}

const createLoginPacket = (username: string): Packet => {
  const data = new SmartBuffer();

  data.writeVarInt(username.length);
  data.writeString(username, 'utf-8');

  return {
    id: 0,
    data: data.toBuffer(),
  };
};
