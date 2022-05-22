import { parseWholeBuffer } from '../parsePacket';
import { EventSchema, IEvent } from './types';

interface Payload {
  id: Buffer;
}

export class KeepAliveReceivedEvent implements IEvent {
  public constructor (public readonly payload: Payload) {}

  public static readonly schema: EventSchema<Payload> = {
    id: parseWholeBuffer()
  };
}