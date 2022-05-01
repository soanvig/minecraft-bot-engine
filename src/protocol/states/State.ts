import { Packet } from '../packet';

export type StateSend = (id: number, data: Buffer) => void;
export type StateSwitchTo = (stateId: number) => void;

export interface StateInitParams {
  send: StateSend;
  switchTo: StateSwitchTo;
}

export abstract class State {
  protected send!: StateSend;
  protected switchTo!: StateSwitchTo;

  abstract id: number;
  abstract receive(packet: Packet): void;
  abstract onSwitchTo(): void;

  public init (params: StateInitParams): void {
    this.send = params.send;
    this.switchTo = params.switchTo;
  }
}