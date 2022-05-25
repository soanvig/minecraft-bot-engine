import { Client } from 'client';
import { PluginMove } from './plugins/PluginMove';
import { PluginPlayers } from './plugins/PluginPlayers';
import { PluginPosition } from './plugins/PluginPosition';

const client = new Client({
  host: 'localhost',
  port: 25565,
  username: 'Bot4',
  debug: true,
});

const players = new PluginPlayers(client);
const position = new PluginPosition(client, players);
const move = new PluginMove(client, players, position);

client.connect();

setTimeout(() => console.log(players.players), 10000);
setInterval(() => move.moveForwardX(0.5), 500);
