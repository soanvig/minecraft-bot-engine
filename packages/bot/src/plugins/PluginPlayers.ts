import { Client, EntityPositionChangedEvent, EntityPositionRotationChangedEvent, PlayersJoinedEvent, PlayersLeftEvent, PlayerSpawnedEvent } from 'client';

export type Player = { uuid: string; name: string };
export type Position = { x: number; y: number; z: number };

export class PluginPlayers {
  public players: Record<string, Player> = {};
  public positions: Record<string, Position> = {};
  private entityIdToUUID: Record<number, string> = {};

  constructor (client: Client) {
    client.addListener(PlayersJoinedEvent, e => this.playersJoinedHandler(e));
    client.addListener(PlayersLeftEvent, e => this.playersLeftHandler(e));
    client.addListener(PlayerSpawnedEvent, e => this.playerSpawnedHandler(e));
    client.addListener(EntityPositionChangedEvent, e => this.entityPositionChanged(e));
    client.addListener(EntityPositionRotationChangedEvent, e => this.entityPositionChanged(e));
  }

  private playersJoinedHandler (e: PlayersJoinedEvent): void {
    e.payload.players.forEach(p => {
      this.players[p.uuid] = {
        uuid: p.uuid,
        name: p.name,
      }
    });
  }

  private playersLeftHandler (e: PlayersLeftEvent): void {
    e.payload.players.forEach(p => {
      delete this.players[p.uuid];
    });
  }

  private playerSpawnedHandler ({ payload }: PlayerSpawnedEvent): void {
    this.entityIdToUUID[payload.id] = payload.uuid;
    this.positions[payload.uuid] = {
      x: payload.x,
      y: payload.y,
      z: payload.z,
    }
  }

  private entityPositionChanged (e: EntityPositionChangedEvent | EntityPositionRotationChangedEvent): void {
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