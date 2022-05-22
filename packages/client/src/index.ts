import { Packet, StatePlay, protocol, ProtocolConfig } from 'protocol';
import { ChunkUpdatedEvent } from './events/ChunkUpdated.event';
import { EntityPositionChangedEvent } from './events/EntityPositionChanged.event';
import { EntityPositionRotationChangedEvent } from './events/EntityPositionRotationChanged.event';
import { EntityRotationChangedEvent } from './events/EntityRotationChanged.event';
import { KeepAliveReceivedEvent } from './events/KeepAliveReceived.event';
import { LivingEntitySpawnedEvent } from './events/LivingEntitySpawned.event';
import { PlayerInfoReceivedEvent } from './events/PlayerInfoReceived.event';
import { PlayerPositionChangedEvent } from './events/PlayerPositionChanged.event';
import { PlayerSpawnedEvent } from './events/PlayerSpawned.event';
import { EventCtor, IEvent } from './events/types';
import { parsePacketData } from './parsePacket';

const packetToEvent: Record<number, EventCtor<any>> = {
  0x02: LivingEntitySpawnedEvent,
  0x04: PlayerSpawnedEvent,
  0x21: KeepAliveReceivedEvent,
  0x22: ChunkUpdatedEvent,
  0x29: EntityPositionChangedEvent,
  0x2A: EntityPositionRotationChangedEvent,
  0x2B: EntityRotationChangedEvent,
  /** @NOTE this packet behaves very strange. It should make action 0 when players joins but it doesn't */
  0x36: PlayerInfoReceivedEvent,
  0x38: PlayerPositionChangedEvent,
}

class Client extends StatePlay {
  private eventHandlers: Map<EventCtor<any>, ((event: IEvent) => void)[]> = new Map();

  public constructor(config: Omit<ProtocolConfig, 'playHandler'>) {
    super();

    protocol({
      ...config,
      playHandler: this,
    });
  }

  public async receive (packet: Packet): Promise<void> {
    if (packet.id === 0x21) {
      this.send({
        id: 0x0F,
        data: packet.data,
      });   
    }

    if (packet.id in packetToEvent) {
      const eventCtor = packetToEvent[packet.id];
      if ('fromPacket' in eventCtor) {
        this.publishEvent(eventCtor, eventCtor.fromPacket(packet));
      } else {
        this.publishEvent(
          eventCtor,
          new eventCtor(parsePacketData(packet.data, eventCtor.schema))
        );
      }
    }
  }

  public async onSwitchTo (): Promise<void> {
  }

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

const client = new Client({
  host: 'localhost',
  port: 25565,
  username: 'Bot4',
});

// client.addListener(PlayerSpawnedEvent, console.log);
// client.addListener(PlayerPositionChangedEvent, console.log);
// client.addListener(EntityPositionRotationChangedEvent, console.log);
// client.addListener(EntityPositionChangedEvent, console.log);
// client.addListener(EntityRotationChangedEvent, console.log);
client.addListener(PlayerInfoReceivedEvent, console.log);
// client.addListener(ChunkUpdatedEvent, (event) => {
//   console.log(JSON.stringify(event.payload, (key, value) =>
//   typeof value === 'bigint'
//       ? value.toString()
//       : value // return everything else unchanged
//   ), 2);
//   process.exit(0);
// });


