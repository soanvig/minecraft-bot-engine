import { Packet } from 'protocol';

export interface IEvent {
  payload: any;
}

export type EventCtor<T extends IEvent> = { fromPacket: (packet: Packet) => Promise<T> };