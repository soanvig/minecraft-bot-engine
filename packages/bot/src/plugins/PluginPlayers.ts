import { Client, ConnectedEvent, GameJoinedEvent,PlayersJoinedEvent, PlayersLeftEvent, PlayerSpawnedEvent } from 'client';

export type Player = { uuid: string; name: string };

export class PluginPlayers {
  public players: Record<string, Player> = {};
  public currentPlayer!: Player;
  private entityIdToUUID: Record<number, string> = {};

  constructor (client: Client) {
    client.addListener(ConnectedEvent, this.connectedHandler)
    client.addListener(GameJoinedEvent, this.gameJoinedHandler)
    client.addListener(PlayersJoinedEvent, this.playersJoinedHandler);
    client.addListener(PlayersLeftEvent, this.playersLeftHandler);
    client.addListener(PlayerSpawnedEvent, this.playerSpawnedHandler);
   
  }

  public getPlayerUUIDByEntityId (entityId: number): string | null {
    return this.entityIdToUUID[entityId] ?? null;
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
  }
}
