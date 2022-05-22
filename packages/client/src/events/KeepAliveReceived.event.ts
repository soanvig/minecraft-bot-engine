import { Packet } from 'protocol';
import { IEvent } from './types';

interface Payload {
  id: Buffer;
}

export class KeepAliveReceivedEvent implements IEvent {
  private constructor (public readonly payload: Payload) {}

  public static async fromPacket(packet: Packet) {
    const id = packet.data;

    return new KeepAliveReceivedEvent({ id });
  }
}