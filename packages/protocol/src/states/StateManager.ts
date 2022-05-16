import { mergeMap, Subscription } from 'rxjs';
import { PacketManager } from '../packets/PacketManager';
import { State, StateId } from './State';

interface StateManagerCtor {
  states: State[];
  packetManager: PacketManager;
}

export class StateManager {
  private activeState!: State;
  private states: State[];
  private packetSubscription: Subscription;
  private packetManager: PacketManager;

  constructor ({ states, packetManager}: StateManagerCtor) {
    this.packetManager = packetManager;
    this.states = states;

    this.packetSubscription = this.packetManager.packets.pipe(
      mergeMap((p) => this.activeState.receive(p))
    ).subscribe();

    states.forEach(state => state.init({
      send: p => this.packetManager.send(p),
      switchTo: id => {
        this.changeActiveState(id);
      },
      enableCompression: t => this.packetManager.setCompressionThreshold(t),
    }));

    this.changeActiveState(StateId.Handshake);
  }

  private changeActiveState (id: StateId): void {
    const state = this.states.find(s => s.id === id);

    if (!state) {
      throw new Error(`Unknown desired state: ${id}`);
    }

    console.log(`Switched to ${StateId[id]}`);

    this.activeState = state;

    /** @TODO handle promise */
    state.onSwitchTo();
  }
}