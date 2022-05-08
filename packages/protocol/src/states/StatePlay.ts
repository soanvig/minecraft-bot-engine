import { State, StateId } from './State';

export abstract class StatePlay extends State {
  public readonly id = StateId.Play;
}
