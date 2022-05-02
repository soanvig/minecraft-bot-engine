import { Packet } from '../packet';

export enum StateId {
  Handshake = 0,
  Login = 2,
  Play = 3,
}

export type StateSend = (id: number, data: Buffer) => void;
export type StateSwitchTo = (stateId: StateId) => void;
export type StateEnableCompression = (threshold: number) => void;

export interface StateInitParams {
  send: StateSend;
  switchTo: StateSwitchTo;
  enableCompression: StateEnableCompression;
}

export abstract class State {
  protected send!: StateSend;
  protected switchTo!: StateSwitchTo;
  protected enableCompression!: StateEnableCompression;

  abstract id: StateId;
  abstract receive(packet: Packet): void;
  abstract onSwitchTo(): void;

  public init (params: StateInitParams): void {
    this.send = params.send;
    this.switchTo = params.switchTo;
    this.enableCompression = params.enableCompression;
  }
}