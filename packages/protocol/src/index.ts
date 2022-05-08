import { Packet } from './packets/packet';
import { protocol } from './protocol';
import { StatePlay } from './states/StatePlay';

class Play extends StatePlay {
  public receive (packet: Packet): void {
    console.log('Play packet', `0x${packet.id.toString(16).padStart(2, '0')}`);
  }

  public onSwitchTo (): void {}
}

protocol({
  host: 'localhost',
  port: 25565,
  username: 'Bot',
  playHandler: new Play(),
});