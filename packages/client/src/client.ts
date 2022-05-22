import { Packet, StatePlay, protocol, ProtocolConfig } from 'protocol';
import { EventCtor, LivingEntitySpawnedEvent, PlayerSpawnedEvent, KeepAliveReceivedEvent, ChunkUpdatedEvent, EntityPositionChangedEvent, EntityPositionRotationChangedEvent, EntityRotationChangedEvent, PlayerInfoReceivedEvent, PlayerPositionChangedEvent, IEvent } from './events';
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

export class Client extends StatePlay {
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
