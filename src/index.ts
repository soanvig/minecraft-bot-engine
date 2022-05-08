import { Packet } from './protocol/packets/packet';
import { start } from './protocol/protocol';
import { StatePlay } from './protocol/states/StatePlay';

class Play extends StatePlay {
  public receive (packet: Packet): void {
    console.log('Play packet', `0x${packet.id.toString(16).padStart(2, '0')}`);
  }

  public onSwitchTo (): void {}
}

start(new Play());