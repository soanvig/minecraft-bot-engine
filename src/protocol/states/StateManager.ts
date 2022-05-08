import { Observable, Subject, Subscription } from 'rxjs';
import { Packet } from '../packets/packet';
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

    states.forEach(state => state.init({
      send: p => this.packetManager.send(p),
      switchTo: id => {
        this.changeActiveState(id);
      },
      enableCompression: t => this.packetManager.setCompressionThreshold(t),
    }));

    this.changeActiveState(StateId.Handshake);

    this.packetSubscription = this.packetManager.packets.subscribe(p => {
      this.activeState.receive(p);
    });
  }

  private changeActiveState (id: number): void {
    const state = this.states.find(s => s.id === id);

    if (!state) {
      throw new Error(`Unknown desired state: ${id}`);
    }

    this.activeState = state;

    state.onSwitchTo();
  }
}