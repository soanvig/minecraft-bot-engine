import { Packet, StatePlay, protocol } from 'protocol';
import { ChunkUpdatedEvent } from './events/ChunkUpdated.event';
import { PlayerPositionUpdatedEvent } from './events/PlayerPositionUpdated.event';
import { EventCtor, IEvent } from './events/types';

const packetToEvent: Record<number, EventCtor<any>> = {
  // this event is not always published, dunno why
  0x38: PlayerPositionUpdatedEvent,
  0x22: ChunkUpdatedEvent,
}

class Client extends StatePlay {
  private eventHandlers: Map<EventCtor<any>, ((event: IEvent) => void)[]> = new Map();

  public async receive (packet: Packet): Promise<void> {
    if (packet.id in packetToEvent) {
      const eventCtor = packetToEvent[packet.id];
        const event = await eventCtor.fromPacket(packet);
        this.publishEvent(eventCtor, event);
    }

    // console.log(packet.id.toString(16));
  }

  public async onSwitchTo (): Promise<void> {}

  /**
   * @returns unsubscribe listener function
   */
  public addListener<T extends IEvent>(event: EventCtor<T>, handler: (event: T) => void) {
    const handlers = this.eventHandlers.get(event) ?? [];

    handlers.push(handler as any);

    this.eventHandlers.set(event, handlers);

    return () => this.removeListener(event, handler);
  }

  public removeListener<T extends IEvent>(event: EventCtor<T>, handler: (event: T) => void) {
    const handlers = this.eventHandlers.get(event) ?? [];

    this.eventHandlers.set(event, handlers.filter(h => h !== handler));
  }

  private publishEvent(eventCtor: EventCtor<any>, event: IEvent) {
    const handlers = this.eventHandlers.get(eventCtor) ?? [];

    handlers.forEach(handler => handler(event));
  }
}

const client = new Client();

// client.addListener(PlayerPositionUpdatedEvent, console.log);
client.addListener(ChunkUpdatedEvent, (event) => {
  console.log(JSON.stringify(event.payload, (key, value) =>
  typeof value === 'bigint'
      ? value.toString()
      : value // return everything else unchanged
  ), 2);
  process.exit(0);
});

protocol({
  host: 'localhost',
  port: 25565,
  username: 'Bot2',
  playHandler: client,
});
