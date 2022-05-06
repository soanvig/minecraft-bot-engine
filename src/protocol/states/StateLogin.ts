import { Packet } from '../packets/packet';
import { SmartBuffer } from '../SmartBuffer';
import { State, StateId } from './State';

const username = 'Bot';

export class StateLogin extends State {
  public readonly id = StateId.Login;

  public receive (packet: Packet): void {
    if (packet.id === 3) {
      const maxPacketSize = packet.data.readVarInt();

      this.enableCompression(maxPacketSize);
    }

    if (packet.id === 2) {
      // md5(OfflinePlayer:Nickname)
      const uuid = packet.data.readBuffer(16);
      console.log('Player uuid', uuid.toString('hex'));

      const nicknameLength = packet.data.readVarInt();
      const nickname = packet.data.readString(nicknameLength);

      console.log('Login nickname', nickname);

      this.switchTo(StateId.Play);
    }
  }

  public onSwitchTo (): void {
    this.send(createLoginPacket());
  }
}

const createLoginPacket = (): Packet => {
  const data = new SmartBuffer();

  data.writeVarInt(username.length);
  data.writeString(username, 'utf-8');

  return {
    id: 0,
    data,
  }
};
