import { Packet } from '../packet';
import { SmartBuffer } from '../SmartBuffer';
import { State, StateId } from './State';

const host = 'localhost';
const port = 25565;
const protocolVersionNumber = 758; // https://wiki.vg/Protocol#Handshaking

export class StateHandshake extends State {
  public readonly id = StateId.Handshake;

  public receive (packet: Packet): void {
    console.log('handshake', packet.id, packet.length);
  }

  public onSwitchTo (): void {
    const targetState = StateId.Login;

    this.send(0, createHandshakePacket(targetState));
    this.switchTo(targetState);
  }
}

const createHandshakePacket = (targetState: number) => {
  const data = new SmartBuffer();

  data.writeVarInt(protocolVersionNumber);
  data.writeVarInt(host.length);
  data.writeString(host, 'utf-8');
  data.writeUInt16BE(port);
  data.writeVarInt(targetState);

  return data.toBuffer();
};