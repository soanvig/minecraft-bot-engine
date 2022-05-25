import { parseInt } from '../parsePacket'
import { EventSchema, IEvent } from './types';

interface Payload {
  entityId: number;
  /** @@TODO Rest of packet Join Game not parsed yet */
}

export class GameJoinedEvent implements IEvent {
  public constructor (public readonly payload: Payload) {}

  public static readonly schema: EventSchema<Payload> = {
    entityId: parseInt(),
  };
}
