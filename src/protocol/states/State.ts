import { Packet } from '../packet';

export type StateSend = (id: number, data: Buffer) => void;
export type StateSwitchTo = (stateId: number) => void;
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

  abstract id: number;
  abstract receive(packet: Packet): void;
  abstract onSwitchTo(): void;

  public init (params: StateInitParams): void {
    this.send = params.send;
    this.switchTo = params.switchTo;
    this.enableCompression = params.enableCompression;
  }
}