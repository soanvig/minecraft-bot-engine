import { Subscription } from 'rxjs';
import { Packet } from '../packets/packet';
import { PacketManager } from '../packets/PacketManager';
import { State, StateId } from './State';

interface StateManagerCtor {
  states: State[];
  packetManager: PacketManager;
}

export class StateManager {
  private activeStateId!: StateId;
  private activeState!: State;
  private states: State[];
  private packetSubscription: Subscription;

  constructor ({ states, packetManager}: StateManagerCtor) {
    this.states = states;

    states.forEach(state => state.init({
      send: p => packetManager.send(p),
      switchTo: id => {
        this.changeActiveState(id);
      },
      enableCompression: (t) => packetManager.setCompressionThreshold(t),
    }));

    this.changeActiveState(StateId.Handshake);

    this.packetSubscription = packetManager.packets.subscribe(p => this.activeState.receive(p));
  }

  private changeActiveState (id: number): void {
    const state = this.states.find(s => s.id === id);

    if (!state) {
      throw new Error(`Unknown desired state: ${id}`);
    }

    this.activeStateId = id;
    this.activeState = state;

    state.onSwitchTo();
  }
}