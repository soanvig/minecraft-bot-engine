import { Client, PlayersJoinedEvent, PlayersLeftEvent } from 'client';

export type Player = { uuid: string; name: string };

export class PluginPlayers {
  public players: Record<string, Player> = {};

  constructor (client: Client) {
    client.addListener(PlayersJoinedEvent, e => this.playersJoinedHandler(e));
    client.addListener(PlayersLeftEvent, e => this.playersLeftHandler(e));
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
}
