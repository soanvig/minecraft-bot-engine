import { Packet } from '../packets/packet';
import { State, StateId } from './State';

export class StatePlay extends State {
  public readonly id = StateId.Play;

  public receive (packet: Packet): void {}

  public onSwitchTo (): void {}
}
