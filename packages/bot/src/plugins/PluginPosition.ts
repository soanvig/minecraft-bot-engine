import { Client, EntityPositionChangedEvent, EntityPositionRotationChangedEvent, PlayerPositionChangedEvent, PlayerSpawnedEvent } from 'client';
import { PluginPlayers } from './PluginPlayers';

export type Position = { x: number; y: number; z: number };

export class PluginPosition {
  private positions: Record<string, Position> = {};

  constructor(
    private client: Client,
    private players: PluginPlayers,
  ) {
    client.addListener(PlayerPositionChangedEvent, this.playerPositionChanged)
    client.addListener(EntityPositionChangedEvent, this.entityPositionChanged);
    client.addListener(EntityPositionRotationChangedEvent, this.entityPositionChanged);
    client.addListener(PlayerSpawnedEvent, this.playerSpawnedHandler);
  }

  public getPlayerPosition(uuid: string): Position | null {
    return this.positions[uuid] ?? null;
  }

  public updatePlayerPosition(uuid: string, position: Position): void {
    this.positions[uuid] = position;
  }

  private playerPositionChanged = (e: PlayerPositionChangedEvent): void => {
    this.positions[this.players.currentPlayer.uuid] = {
      x: e.payload.x,
      y: e.payload.y,
      z: e.payload.z,
    };
  }

  private playerSpawnedHandler = ({ payload }: PlayerSpawnedEvent): void => {
    this.positions[payload.uuid] = {
      x: payload.x,
      y: payload.y,
      z: payload.z,
    }
  }

  private entityPositionChanged = (e: EntityPositionChangedEvent | EntityPositionRotationChangedEvent): void => {
    const uuid = this.players.getPlayerUUIDByEntityId(e.payload.id);

    if (!uuid) {
      return;
    }

    const player = this.positions[uuid];

    if (!player) {
      return;
    }

    player.x = (e.payload.deltaX / 128 + player.x * 32) / 32;
    player.y = (e.payload.deltaY / 128 + player.y * 32) / 32;
    player.z = (e.payload.deltaZ / 128 + player.z * 32) / 32;
  }
}