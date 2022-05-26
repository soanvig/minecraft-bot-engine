# minecraft-bot-engine

## Packages

Package | Description
--- | ---
nbt | [NBT format](https://wiki.vg/NBT) implementation.
protocol | Handles connection with Minecraft server, performs handshake and authentication, and returns protocol object to receive packets from and send packets to
client | Wraps protocol by parsing server packets into typed events, and sends requests to server using commands.
bot | Actual Minecraft bot engine.
