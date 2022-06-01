import { Client, SetPlayerPositionCommand } from 'client';
import { Vec3 } from '../vec3';
import { PluginPlayers } from './PluginPlayers';
import { PluginPosition } from './PluginPosition';

const followingInterval = 100; // [ms]
const walkingInterval = 25; // [ms]
const walkingSpeed = 4.3; // [m/s] 
const maxVelocity = 25; // [m/s] - theoretical max is 100 before teleporting, but then bot is super fast

export class PluginMove {
  private targetPosition: Vec3 | null = null;
  private movementIntervalId: NodeJS.Timer | null = null;
  private followingUpdateIntervalId: NodeJS.Timer | null = null;

  constructor(
    private client: Client,
    private players: PluginPlayers,
    private position: PluginPosition,
  ) {}

  public startMovementTo(targetPosition: Vec3) {
    this.targetPosition = targetPosition;
    /** @TODO don't conflict with startFollowingByName */
    this.movementIntervalId = setInterval(() => this.movementLoop(), walkingInterval);
  }

  public startFollowingByName(name: string) {
    const player = this.players.getPlayerByName(name);

    if (!player) {
      throw new Error(`Cannot find player by name: ${name}`);
    }

    this.followPlayer(player.uuid);
    this.followingUpdateIntervalId = setInterval(
      () => this.followPlayer(player.uuid),
      followingInterval
    );

    /** @TODO don't conflict with startMovementTo */
    this.movementIntervalId = setInterval(() => this.movementLoop(), walkingInterval);
  }

  private followPlayer(uuid: string) {
    const targetPosition = this.position.getPlayerPosition(uuid);

    if (!targetPosition) {
      throw new Error(`Unknown current position of player ${uuid}`);
    }

    this.targetPosition = targetPosition;
  }

  private movementLoop() {
    if (!this.targetPosition) {
      return;
    }

    const currentPosition = this.getPlayerCurrentPosition();
    const distanceVector = this.targetPosition.sub(currentPosition);
    const distance = distanceVector.norm();

    const velocityVector = distanceVector
      .scale(maxVelocity / distance)
      .scale(walkingInterval / 1000);

    const newPosition = currentPosition.add(velocityVector);

    this.client.send(new SetPlayerPositionCommand({
      x: newPosition.x,
      y: newPosition.y,
      z: newPosition.z,
      onGround: true,
    }));

    this.position.updatePlayerPosition(
      this.players.currentPlayer.uuid,
      newPosition
    );
  }

  private getPlayerCurrentPosition() {
    const uuid = this.players.currentPlayer.uuid;
    const playerPosition = this.position.getPlayerPosition(uuid);

    if (!playerPosition) {
      throw new Error(`Unknown current position of player ${uuid}`);
    }

    return playerPosition;
  }
}