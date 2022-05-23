import { Client } from 'client';
import { PluginPlayers } from './plugins/PluginPlayers';

const client = new Client({
  host: 'localhost',
  port: 25565,
  username: 'Bot4',
});

const players = new PluginPlayers(client);

client.connect();

setTimeout(() => console.log(players.players), 10000);
setTimeout(() => console.log(players.positions), 10000);