import { Packet } from '../packet';
import { State, StateId } from './State';

export class StatePlay extends State {
  public readonly id = StateId.Play;

  public receive (packet: Packet): void {
    console.log('play', `0x${packet.id.toString(16).padStart(2, '0')}`, packet.length);
  }

  public onSwitchTo (): void {
  }
}
