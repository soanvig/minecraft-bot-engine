import { Client } from 'client';
import { PluginPlayers } from './plugins/PluginPlayers';

export class Bot {
  public players: PluginPlayers;

  public constructor (private client: Client) {
    this.players = new PluginPlayers(client);
  }
}
