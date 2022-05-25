import { Packet, Protocol, protocol, ProtocolConfig } from 'protocol';
import { Subscription } from 'rxjs';
import { EventCtor, LivingEntitySpawnedEvent, PlayerSpawnedEvent, KeepAliveReceivedEvent, EntityPositionChangedEvent, EntityPositionRotationChangedEvent, EntityRotationChangedEvent, PlayerInfoReceivedEvent, PlayerPositionChangedEvent, IEvent} from './events';
import { ConnectedEvent } from './events/internal-events';
import { parsePacketData } from './parsePacket';

const packetToEvent: Record<number, EventCtor<any>> = {
  0x02: LivingEntitySpawnedEvent,
  0x04: PlayerSpawnedEvent,
  0x21: KeepAliveReceivedEvent,
  /** @NOTE in progress */
  // 0x22: ChunkUpdatedEvent,
  0x29: EntityPositionChangedEvent,
  0x2A: EntityPositionRotationChangedEvent,
  0x2B: EntityRotationChangedEvent,
  0x36: PlayerInfoReceivedEvent,
  0x38: PlayerPositionChangedEvent,
}

type EventHandlers = Map<EventCtor<any>, ((event: IEvent) => void)[]>;

export class Client {
  private eventHandlers: EventHandlers = new Map();

  private protocol!: Protocol;
  private packetSubscription!: Subscription;

  public constructor(
    private protocolConfig: ProtocolConfig
  ) {}

  public async connect(): Promise<void> {
    if (this.protocol) {
      throw new Error('Client is already connected');
    }

    this.protocol = await protocol(this.protocolConfig);

    this.packetSubscription = this.protocol.packets.subscribe({
      next: p => this.handlePacket(p)
    });

    this.publishEvent(ConnectedEvent, new ConnectedEvent({
      uuid: this.protocol.uuid,
      name: this.protocol.name,
    }));
  }

  public getCurrentPlayerData() {
    return {
      uuid: this.protocol.uuid,
      name: this.protocol.name,
    }
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

  private async handlePacket (packet: Packet): Promise<void> {
    if (packet.id === 0x21) {
      /** Keep alive */
      this.protocol.send({
        id: 0x0F,
        data: packet.data,
      });
    }

    if (packet.id in packetToEvent) {
      const eventCtor = packetToEvent[packet.id];
      if ('fromPacket' in eventCtor) {
        // This can return different event actually
        // therefore we publish created constructor, not eventCtor
        const event = eventCtor.fromPacket(packet);
        this.publishEvent(event.constructor, event);
      } else {
        const [data] = parsePacketData(packet.data, eventCtor.schema);

        this.publishEvent(
          eventCtor,
          new eventCtor(data)
        );
      }
    }
  }

  private publishEvent(eventCtor: EventCtor<any>, event: IEvent) {
    const handlers = this.eventHandlers.get(eventCtor) ?? [];

    handlers.forEach(handler => handler(event));
  }
}
