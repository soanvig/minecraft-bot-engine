# minecraft-bot-engine

## Packages

Package | Description
--- | ---
nbt | [NBT format](https://wiki.vg/NBT) implementation.
protocol | Handles connection with Minecraft server, performs handshake and authentication, and forwards packets to `StatePlay`.
client | Implements `StatePlay` by parsing server packets into typed events, and sends requests to server using commands.
bot | Example bot implementation
