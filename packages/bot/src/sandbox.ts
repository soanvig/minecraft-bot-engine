import { Client } from 'client';
import { PluginMove } from './plugins/PluginMove';
import { PluginPlayers } from './plugins/PluginPlayers';
import { PluginPosition } from './plugins/PluginPosition';
import { PluginWorld } from './plugins/PluginWorld';

const client = new Client({
  host: 'localhost',
  port: 25565,
  username: 'Bot4',
  debug: false,
});

const players = new PluginPlayers(client);
const position = new PluginPosition(client, players);
const move = new PluginMove(client, players, position);
const world = new PluginWorld(client);

client.connect();

setTimeout(() => console.log(players.players), 10000);
setTimeout(() => move.startFollowingByName('BlackHedgecat'), 5000);
