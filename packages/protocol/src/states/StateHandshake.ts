import { Packet } from '../packets/packet';
import { SmartBuffer } from '../SmartBuffer';
import { State, StateId } from './State';

const host = 'localhost';
const port = 25565;
const protocolVersionNumber = 758; // https://wiki.vg/Protocol#Handshaking

export class StateHandshake extends State {
  public readonly id = StateId.Handshake;

  public async receive (packet: Packet): Promise<void> {}

  public async onSwitchTo (): Promise<void> {
    const targetState = StateId.Login;

    this.send(createHandshakePacket(targetState));
    this.switchTo(targetState);
  }
}

const createHandshakePacket = (targetState: number): Packet => {
  const data = new SmartBuffer();

  data.writeVarInt(protocolVersionNumber);
  data.writeVarInt(host.length);
  data.writeString(host, 'utf-8');
  data.writeUInt16BE(port);
  data.writeVarInt(targetState);

  return {
    id: 0,
    data: data.toBuffer(),
  };
};