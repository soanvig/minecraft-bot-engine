import { Client, SetPlayerPositionCommand } from 'client';
import { PluginPlayers } from './PluginPlayers';
import { PluginPosition } from './PluginPosition';

export class PluginMove {
  constructor(
    private client: Client,
    private players: PluginPlayers,
    private position: PluginPosition,
  ) {}

  public moveForwardX(value: number) {
    const uuid = this.players.currentPlayer.uuid;
    const position = this.position.getPlayerPosition(uuid);

    if (!position) {
      throw new Error(`Unknown current position of player ${uuid}`);
    }

    const newPosition = {
      x: position.x + value,
      y: position.y,
      z: position.z,
    }

    this.client.send(new SetPlayerPositionCommand({
      ...newPosition,
      onGround: true,
    }));

    this.position.updatePlayerPosition(uuid, newPosition);
  }
}