import { Packet, StatePlay, protocol } from 'protocol';
import { PlayerPositionUpdatedEvent } from './events/PlayerPositionUpdated.event';
import { EventCtor, IEvent } from './events/types';

const packetToEvent: Record<number, EventCtor> = {
  0x38: PlayerPositionUpdatedEvent,
}

class Client extends StatePlay {
  private eventHandlers: Map<EventCtor, ((event: IEvent) => void)[]> = new Map();

  public receive (packet: Packet): void {
    if (packet.id in packetToEvent) {
      const eventCtor = packetToEvent[packet.id];

      this.publishEvent(eventCtor, new eventCtor(packet));
    }

    console.log(packet.id.toString(16));
  }

  public onSwitchTo (): void {}

  public addListener<T extends EventCtor>(event: T, handler: (event: InstanceType<T>) => void) {
    const handlers = this.eventHandlers.get(event) ?? [];

    handlers.push(handler as any);

    this.eventHandlers.set(event, handlers);
  }

  public removeListener<T extends EventCtor>(event: T, handler: (event: InstanceType<T>) => void) {}

  private publishEvent(eventCtor: EventCtor, event: IEvent) {
    const handlers = this.eventHandlers.get(eventCtor) ?? [];

    handlers.forEach(handler => handler(event));
  }
}

protocol({
  host: 'localhost',
  port: 25565,
  username: 'Bot2',
  playHandler: new Client(),
});
