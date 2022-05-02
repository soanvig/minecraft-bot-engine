import { Packet } from '../packet';
import { State } from './State';

export class StatePlay extends State {
  public readonly id = 3;

  public receive (packet: Packet): void {
    // console.log('play', packet.id, packet.length);
  }

  public onSwitchTo (): void {
  }
}
