import { Packet, SmartBuffer } from 'protocol';
import { parsePacketData, parseVarInt, parseBoolean, parseIterate, parseUUID, parseString, parseObject, Parser } from '../parsePacket';
import { EventSchema, IEvent } from './types';

interface PlayerInfoHeader {
  action: number;
}

type PlayerJoinedPayload = {
  playersCount: number;
  players: {
    uuid: string;
    name: string;
    properties: { name: string; value: string; isSigned: boolean; signature: string | null }[];
    gameMode: number;
    ping: number;
    hasDisplayName: boolean;
    displayName: string | null;
  }[]
};

type PlayerGameModeUpdatedPayload = {
  playersCount: number;
  players: {
    uuid: string;
    gameMode: number;
  }[]
}

type PlayerPingUpdatedPayload = {
  playersCount: number;
  players: {
    uuid: string;
    ping: number;
  }[];
}

type PlayerDisplayNameUpdatedPayload = {
  playersCount: number;
  players: {
    uuid: string;
    hasDisplayName: boolean;
    displayName: string | null;
  }[]
};

type PlayerLeftPayload = {
  playersCount: number;
  players: {
    uuid: string;
  }[]
};

const parsePlayers = <P extends Parser<any>, T extends Record<string, P>>(playerSchema: T) => {
  return {
    playersCount: parseVarInt(),
    players: (b: SmartBuffer, ctx: any) => {
      return parseIterate(ctx.playersCount, parseObject({
        uuid: parseUUID(),
        ...playerSchema,
      }))(b);
    }
  }
}

export class PlayersJoinedEvent implements IEvent {
  public constructor (public readonly payload: PlayerJoinedPayload) {}

  public static readonly schema: EventSchema<PlayerJoinedPayload> = {
    ...parsePlayers({
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
    }),
  };
}

export class PlayersGameModeUpdatedEvent implements IEvent {
  public constructor (public readonly payload: PlayerGameModeUpdatedPayload) {}

  public static readonly schema: EventSchema<PlayerGameModeUpdatedPayload> = {
    ...parsePlayers({
      gameMode: parseVarInt(),
    })
  }
}

export class PlayersPingUpdatedEvent implements IEvent {
  public constructor (public readonly payload: PlayerPingUpdatedPayload) {}

  public static readonly schema: EventSchema<PlayerPingUpdatedPayload> = {
    ...parsePlayers({
      ping: parseVarInt(),
    })
  }
}

export class PlayersDisplayNameUpdatedEvent implements IEvent {
  public constructor (public readonly payload: PlayerDisplayNameUpdatedPayload) {}

  public static readonly schema: EventSchema<PlayerDisplayNameUpdatedPayload> = {
    ...parsePlayers({
      hasDisplayName: parseBoolean(),
      displayName: (b: SmartBuffer, ctx: any) => ctx.hasDisplayName ? parseString()(b) : null,
    })
  };
}

export class PlayersLeftEvent implements IEvent {
  public constructor (public readonly payload: PlayerLeftPayload) {}

  public static readonly schema: EventSchema<PlayerLeftPayload> = {
    ...parsePlayers({}),
  }
}

export class PlayerInfoReceivedEvent implements IEvent {
  public constructor (public readonly payload: PlayerInfoHeader) {}

  public static fromPacket(packet: Packet) {
    const [header, restData] = parsePacketData(packet.data, {
      action: parseVarInt(),
    });

    let event;

    switch (header.action) {
      case 0: event = PlayersJoinedEvent; break
      case 1: event = PlayersGameModeUpdatedEvent; break
      case 2: event = PlayersPingUpdatedEvent; break
      case 3: event = PlayersDisplayNameUpdatedEvent; break
      case 4: event = PlayersLeftEvent; break
      default: throw new Error(`Unknown action ${header.action} for PlayerInfo packet`)
    }

    const [data] = parsePacketData(restData, event.schema);
    
    return new event(data);
  }
}