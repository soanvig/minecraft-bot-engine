import { PlayerSpawnedEvent, PlayerPositionChangedEvent, GameJoinedEvent } from './events';
import { Client } from './client';

const client = new Client({
  host: 'localhost',
  port: 25565,
  username: 'Bot4',
});

client.addListener(PlayerSpawnedEvent, console.log);
client.addListener(PlayerPositionChangedEvent, console.log);
client.addListener(GameJoinedEvent, console.log);
// client.addListener(EntityPositionRotationChangedEvent, console.log);
// client.addListener(EntityPositionChangedEvent, console.log);
// client.addListener(EntityRotationChangedEvent, console.log);
// client.addListener(PlayerInfoReceivedEvent, console.log);
// client.addListener(ChunkUpdatedEvent, (event) => {
//   console.log(JSON.stringify(event.payload, (key, value) =>
//   typeof value === 'bigint'
//       ? value.toString()
//       : value // return everything else unchanged
//   ), 2);
//   process.exit(0);
// });

client.connect();
