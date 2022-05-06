import { Packet } from '../packets/packet';
import { SmartBuffer } from '../SmartBuffer';
import { State, StateId } from './State';

export class StatePlay extends State {
  public readonly id = StateId.Play;

  public receive (packet: Packet): void {
    console.log('play', `0x${packet.id.toString(16).padStart(2, '0')}`);
  }

  public onSwitchTo (): void {
    // Timeout is necessary at this moment due to warning https://wiki.vg/Protocol#Login_Success
    setTimeout(() => {
      console.log('Sending chat message!');
      this.send(createChatMessagePacket('Hello!'));
    }, 1000);
  }
}

const createChatMessagePacket = (message: string): Packet => {
  const data = new SmartBuffer();

  data.writeVarInt(message.length);
  data.writeString(message);

  return {
    id: 3,
    data,
  }
};