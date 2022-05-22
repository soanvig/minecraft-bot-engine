import { Packet } from 'protocol';
import { Parser } from '../parsePacket';

export interface IEvent {
  payload: any;
}

export type EventSchema<T> = { [K in keyof T]: Parser<T[K]> };

export type EventCtor<T extends IEvent> = {
  new (...args: any[]): T;
  schema: EventSchema<any>;
} | { fromPacket: (packet: Packet) => T }