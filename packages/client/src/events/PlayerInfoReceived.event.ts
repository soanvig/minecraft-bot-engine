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

type PlayerGameModeUpdatedPayload = {
  uuid: string;
  gameMode: number;
}[];

type PlayerPingUpdatedPayload = {
  uuid: string;
  ping: number;
}[];

type PlayerDisplayNameUpdatedPayload = {
  uuid: string;
  hasDisplayName: boolean;
  displayName: string | null;
}[];

type PlayerLeftPayload = {
  uuid: string;
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

export class PlayersGameModeUpdatedEvent implements IEvent {
  private constructor (public readonly payload: PlayerGameModeUpdatedPayload) {}

  public static async fromPacket(packet: Packet) {
    const [data] = parsePacketData(packet.data, {
      playersCount: parseVarInt(),
      players: (b: SmartBuffer, ctx: any) => {
        return parseIterate(ctx.playersCount, parseObject({
          uuid: parseUUID(),
          gameMode: parseVarInt(),
        }))(b);
      },
    });

    return new PlayersGameModeUpdatedEvent(data.players);
  }
}

export class PlayersPingUpdatedEvent implements IEvent {
  private constructor (public readonly payload: PlayerPingUpdatedPayload) {}

  public static async fromPacket(packet: Packet) {
    const [data] = parsePacketData(packet.data, {
      playersCount: parseVarInt(),
      players: (b: SmartBuffer, ctx: any) => {
        return parseIterate(ctx.playersCount, parseObject({
          uuid: parseUUID(),
          ping: parseVarInt(),
        }))(b);
      },
    });

    return new PlayersPingUpdatedEvent(data.players);
  }
}

export class PlayersDisplayNameUpdatedEvent implements IEvent {
  private constructor (public readonly payload: PlayerDisplayNameUpdatedPayload) {}

  public static async fromPacket(packet: Packet) {
    const [data] = parsePacketData(packet.data, {
      playersCount: parseVarInt(),
      players: (b: SmartBuffer, ctx: any) => {
        return parseIterate(ctx.playersCount, parseObject({
          uuid: parseUUID(),
          hasDisplayName: parseBoolean(),
          displayName: (b: SmartBuffer, ctx: any) => ctx.hasDisplayName ? parseString()(b) : null,
        }))(b);
      },
    });

    return new PlayersDisplayNameUpdatedEvent(data.players);
  }
}

export class PlayersLeftEvent implements IEvent {
  private constructor (public readonly payload: PlayerLeftPayload) {}

  public static async fromPacket(packet: Packet) {
    const [data] = parsePacketData(packet.data, {
      playersCount: parseVarInt(),
      players: (b: SmartBuffer, ctx: any) => {
        return parseIterate(ctx.playersCount, parseObject({
          uuid: parseUUID(),
        }))(b);
      },
    });

    return new PlayersLeftEvent(data.players);
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
      case 1: return await PlayersGameModeUpdatedEvent.fromPacket(restPacket);
      case 2: return await PlayersPingUpdatedEvent.fromPacket(restPacket);
      case 3: return await PlayersDisplayNameUpdatedEvent.fromPacket(restPacket);
      case 4: return await PlayersLeftEvent.fromPacket(restPacket);
      default: throw new Error(`Unknown action ${header.action} for PlayerInfo packet`)
    }
  }
}