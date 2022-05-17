import { Packet, StatePlay, protocol } from 'protocol';
import { ChunkUpdatedEvent } from './events/ChunkUpdated.event';
import { EntityPositionChangedEvent } from './events/EntityPositionChanged.event';
import { EntityPositionRotationChangedEvent } from './events/EntityPositionRotationChanged.event';
import { EntityRotationChangedEvent } from './events/EntityRotationChanged.event';
import { KeepAliveReceivedEvent } from './events/KeepAliveReceived.event';
import { LivingEntitySpawnedEvent } from './events/LivingEntitySpawned.event';
import { PlayerPositionUpdatedEvent } from './events/PlayerPositionUpdated.event';
import { PlayerSpawnedEvent } from './events/PlayerSpawned.event';
import { EventCtor, IEvent } from './events/types';

const packetToEvent: Record<number, EventCtor<any>> = {
  0x02: LivingEntitySpawnedEvent,
  0x04: PlayerSpawnedEvent,
  0x21: KeepAliveReceivedEvent,
  0x22: ChunkUpdatedEvent,
  0x29: EntityPositionChangedEvent,
  0x2A: EntityPositionRotationChangedEvent,
  0x2B: EntityRotationChangedEvent,
  0x38: PlayerPositionUpdatedEvent,
}

class Client extends StatePlay {
  private eventHandlers: Map<EventCtor<any>, ((event: IEvent) => void)[]> = new Map();

  public async receive (packet: Packet): Promise<void> {
    if (packet.id === 0x21) {
      this.send({
        id: 0x0F,
        data: packet.data,
      });   
    }

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

client.addListener(PlayerSpawnedEvent, console.log);
client.addListener(PlayerPositionUpdatedEvent, console.log);
client.addListener(EntityPositionRotationChangedEvent, console.log);
client.addListener(EntityPositionChangedEvent, console.log);
client.addListener(EntityRotationChangedEvent, console.log);
// client.addListener(ChunkUpdatedEvent, (event) => {
//   console.log(JSON.stringify(event.payload, (key, value) =>
//   typeof value === 'bigint'
//       ? value.toString()
//       : value // return everything else unchanged
//   ), 2);
//   process.exit(0);
// });

protocol({
  host: 'localhost',
  port: 25565,
  username: 'Bot3',
  playHandler: client,
});
