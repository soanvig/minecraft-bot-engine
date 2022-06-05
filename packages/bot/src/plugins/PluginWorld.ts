import { ChunkUpdatedEvent, Client } from 'client';

export class PluginWorld {
  constructor(
    private client: Client,
  ) {
    client.addListener(ChunkUpdatedEvent, this.chunkUpdated)
  }

  private chunkUpdated = (e: ChunkUpdatedEvent) => {
    console.log(e.payload.dataSections);
  }
}