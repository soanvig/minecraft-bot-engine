import { IEvent } from '.';

type Payload = { uuid: string, name: string };

export class ConnectedEvent implements IEvent {
  public static schema = {};
  constructor(public payload: Payload) {}
}