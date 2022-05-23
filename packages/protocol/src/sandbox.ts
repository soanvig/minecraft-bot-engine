import { protocol } from './protocol';

(async () => {
  const connection = await protocol({
    host: 'localhost',
    port: 25565,
    username: 'ProtocolSandbox',
  });

  console.log(connection.name);
  console.log(connection.uuid);
})();
