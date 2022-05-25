import { Packet, SmartBuffer } from 'protocol';
import { ICommand } from '.';

interface Payload {
  x: number;
  y: number;
  z: number;
  onGround: boolean;
}

export class SetPlayerPositionCommand implements ICommand {
  constructor (private payload: Payload) {}

  public toPacket(): Packet {
    const data = new SmartBuffer();

    data.writeDoubleBE(this.payload.x);
    data.writeDoubleBE(this.payload.y);
    data.writeDoubleBE(this.payload.z);
    data.writeUInt8(Number(this.payload.onGround));

    return {
      id: 0x11,
      data: data.toBuffer(),
    };
  }
}