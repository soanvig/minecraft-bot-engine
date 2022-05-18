import { Packet, parsePacketData, parseVarInt, parseBoolean, parseIterate, parseUUID, parseString, parseObject, SmartBuffer } from 'protocol';
import { IEvent } from './types';

interface PlayerInfoHeader {
  action: number;
}

type PlayerJoinedPayload = {
  uuid: string;
  name: string;
  properties: { name: string; value: string; isSigned: boolean; signature: string | null }[];
  gameMode: number;
  ping: number;
  hasDisplayName: boolean;
  displayName: string | null;
}[];

export class PlayersJoinedEvent implements IEvent {
  private constructor (public readonly payload: PlayerJoinedPayload) {}

  public static async fromPacket(packet: Packet) {
    const [data] = parsePacketData(packet.data, {
      playersCount: parseVarInt(),
      players: (b: SmartBuffer, ctx: any) => {
        return parseIterate(ctx.playersCount, parseObject({
          uuid: parseUUID(),
          name: parseString(),
          propertiesCount: parseVarInt(),
          properties: (b: SmartBuffer, ctx: any) => {
            return parseIterate(ctx.propertiesCount, parseObject({
                name: parseString(),
                value: parseString(),
                isSigned: parseBoolean(),
                signature: (b: SmartBuffer, ctx: any) => ctx.isSigned ? parseString()(b) : null,
              }))(b);
          },
          gameMode: parseVarInt(),
          ping: parseVarInt(),
          hasDisplayName: parseBoolean(),
          displayName: (b: SmartBuffer, ctx: any) => ctx.hasDisplayName ? parseString()(b) : null,
        }))(b);
      },
    });

    return new PlayersJoinedEvent(data.players);
  }
}

export class PlayerInfoReceivedEvent implements IEvent {
  private constructor (public readonly payload: PlayerInfoHeader) {}

  public static async fromPacket(packet: Packet) {
    const [header, restData] = parsePacketData(packet.data, {
      action: parseVarInt(),
    });

    const restPacket = { id: packet.id, data: restData };

    switch (header.action) {
      case 0: return await PlayersJoinedEvent.fromPacket(restPacket);
      default: return new PlayerInfoReceivedEvent({ ...header });
    }
  }
}