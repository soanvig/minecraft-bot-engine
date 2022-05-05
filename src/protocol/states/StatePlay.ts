import { Packet } from '../packet';
import { SmartBuffer } from '../SmartBuffer';
import { State, StateId } from './State';

export class StatePlay extends State {
  public readonly id = StateId.Play;

  public receive (packet: Packet): void {
    console.log('play', `0x${packet.id.toString(16).padStart(2, '0')}`, packet.length);
  }

  public onSwitchTo (): void {
    setTimeout(() => {
      console.log('Sending chat message!');
      this.send(3, createChatMessagePacket('Hello!'));
    }, 5000);
  }
}

const createChatMessagePacket = (message: string) => {
  const data = new SmartBuffer();

  data.writeVarInt(message.length);
  data.writeString(message);

  return data.toBuffer();
};