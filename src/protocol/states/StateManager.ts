import { Packet } from '../packet';
import { State, StateId } from './State';

interface StateManagerCtor {
  states: State[];
  onSend: (id: number, data: Buffer) => void;
  enableCompression: (threshold: number) => void;
}

export class StateManager {
  private activeStateId!: StateId;
  private activeState!: State;
  private states: State[];

  constructor (ctor: StateManagerCtor) {
    this.states = ctor.states;

    ctor.states.forEach(state => state.init({
      send: ctor.onSend,
      switchTo: id => {
        this.changeActiveState(id);
      },
      enableCompression: ctor.enableCompression,
    }));

    this.changeActiveState(StateId.Handshake);
  }

  public receive (packet: Packet): void {
    this.activeState.receive(packet);
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