import { Packet } from 'protocol';

export interface ICommand {
  toPacket(): Packet;
}