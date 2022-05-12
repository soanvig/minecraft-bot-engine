import { Packet } from 'protocol';

export interface IEvent {
  payload: any;
}

export type EventCtor = new (packet: Packet) => IEvent;