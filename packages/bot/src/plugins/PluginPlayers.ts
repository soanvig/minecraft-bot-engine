import { Client, ConnectedEvent, EntityPositionChangedEvent, EntityPositionRotationChangedEvent, GameJoinedEvent, PlayerPositionChangedEvent, PlayersJoinedEvent, PlayersLeftEvent, PlayerSpawnedEvent } from 'client';

export type Player = { uuid: string; name: string };
export type Position = { x: number; y: number; z: number };

export class PluginPlayers {
  public players: Record<string, Player> = {};
  public positions: Record<string, Position> = {};
  public currentPlayer!: Player;
  private entityIdToUUID: Record<number, string> = {};

  constructor (client: Client) {
    client.addListener(ConnectedEvent, this.connectedHandler)
    client.addListener(GameJoinedEvent, this.gameJoinedHandler)
    client.addListener(PlayerPositionChangedEvent, this.playerPositionChanged)
    client.addListener(PlayersJoinedEvent, this.playersJoinedHandler);
    client.addListener(PlayersLeftEvent, this.playersLeftHandler);
    client.addListener(PlayerSpawnedEvent, this.playerSpawnedHandler);
    client.addListener(EntityPositionChangedEvent, this.entityPositionChanged);
    client.addListener(EntityPositionRotationChangedEvent, this.entityPositionChanged);
  }

  private connectedHandler = (e: ConnectedEvent): void => {
    const data = {
      name: e.payload.name,
      uuid: e.payload.uuid,
    };

    this.players[e.payload.uuid] = data;
    this.currentPlayer = data;
  }

  private gameJoinedHandler = (e: GameJoinedEvent): void => {
    this.entityIdToUUID[e.payload.entityId] = this.currentPlayer.uuid;
  }

  private playerPositionChanged = (e: PlayerPositionChangedEvent): void => {
    this.positions[this.currentPlayer.uuid] = {
      x: e.payload.x,
      y: e.payload.y,
      z: e.payload.z,
    };
  }

  private playersJoinedHandler = (e: PlayersJoinedEvent): void => {
    e.payload.players.forEach(p => {
      this.players[p.uuid] = {
        uuid: p.uuid,
        name: p.name,
      }
    });
  }

  private playersLeftHandler = (e: PlayersLeftEvent): void => {
    e.payload.players.forEach(p => {
      delete this.players[p.uuid];
    });
  }

  private playerSpawnedHandler = ({ payload }: PlayerSpawnedEvent): void => {
    this.entityIdToUUID[payload.id] = payload.uuid;
    this.positions[payload.uuid] = {
      x: payload.x,
      y: payload.y,
      z: payload.z,
    }
  }

  private entityPositionChanged = (e: EntityPositionChangedEvent | EntityPositionRotationChangedEvent): void => {
    const uuid = this.entityIdToUUID[e.payload.id];
    const player = this.positions[uuid];

    if (!player) {
      return;
    }

    player.x = (e.payload.deltaX / 128 + player.x * 32) / 32;
    player.y = (e.payload.deltaY / 128 + player.y * 32) / 32;
    player.z = (e.payload.deltaZ / 128 + player.z * 32) / 32;
  }
}
