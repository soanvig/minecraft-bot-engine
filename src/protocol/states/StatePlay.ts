import { Packet } from '../packet';
import { State, StateId } from './State';

export class StatePlay extends State {
  public readonly id = StateId.Play;

  public receive (packet: Packet): void {
    // console.log('play', packet.id, packet.length);
  }

  public onSwitchTo (): void {
  }
}
