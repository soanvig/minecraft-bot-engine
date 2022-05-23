import { Client } from 'client';
import { Bot } from '.';

const client = new Client({
  host: 'localhost',
  port: 25565,
  username: 'Bot4',
});

const bot = new Bot(client);

client.connect();

setTimeout(() => console.log(bot.players.players), 10000);
setTimeout(() => console.log(bot.players.positions), 10000);