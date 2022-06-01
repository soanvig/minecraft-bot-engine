import { Client, EntityPositionChangedEvent, EntityPositionRotationChangedEvent, PlayerPositionChangedEvent, PlayerSpawnedEvent } from 'client';
import { Vec3 } from '../vec3';
import { PluginPlayers } from './PluginPlayers';

export class PluginPosition {
  private positions: Record<string, Vec3> = {};

  constructor(
    private client: Client,
    private players: PluginPlayers,
  ) {
    client.addListener(PlayerPositionChangedEvent, this.playerPositionChanged)
    client.addListener(EntityPositionChangedEvent, this.entityPositionChanged);
    client.addListener(EntityPositionRotationChangedEvent, this.entityPositionChanged);
    client.addListener(PlayerSpawnedEvent, this.playerSpawnedHandler);
  }

  public getPlayerPosition(uuid: string): Vec3 | null {
    return this.positions[uuid] ?? null;
  }

  public updatePlayerPosition(uuid: string, position: Vec3): void {
    this.positions[uuid] = position;
  }

  private playerPositionChanged = (e: PlayerPositionChangedEvent): void => {
    this.positions[this.players.currentPlayer.uuid] = new Vec3(
      e.payload.x,
      e.payload.y,
      e.payload.z,
    );
  }

  private playerSpawnedHandler = ({ payload }: PlayerSpawnedEvent): void => {
    this.positions[payload.uuid] = new Vec3(
      payload.x,
      payload.y,
      payload.z,
    );
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

    this.positions[uuid] = new Vec3(
      (e.payload.deltaX / 128 + player.x * 32) / 32,
      (e.payload.deltaY / 128 + player.y * 32) / 32,
      (e.payload.deltaZ / 128 + player.z * 32) / 32
    )
  }
}