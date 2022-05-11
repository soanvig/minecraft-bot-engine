import { Packet } from '../packets/packet';
import { parseBuffer, parsePacket, parseString, parseVarInt } from '../packets/parsePacket';
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

  public receive (packet: Packet): void {
    if (packet.id === 3) {
      const { maxPacketSize } = parsePacket(packet, {
        maxPacketSize: parseVarInt(),
      })

      this.enableCompression(maxPacketSize);
    }

    if (packet.id === 2) {
      const result = parsePacket(packet, {
        // md5(OfflinePlayer:Nickname)
        uuid: parseBuffer(16),
        nickname: parseString(),
      })

      console.log('Login uuid', result.uuid.toString('hex'));
      console.log('Login nickname', result.nickname);

      this.switchTo(StateId.Play);
    }
  }

  public onSwitchTo (): void {
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
