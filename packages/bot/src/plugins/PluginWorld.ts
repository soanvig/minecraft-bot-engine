import { ChunkUpdatedEvent, Client } from 'client';

export class PluginWorld {
  constructor(
    private client: Client,
  ) {
    client.addListener(ChunkUpdatedEvent, this.chunkUpdated)
  }

  private chunkUpdated = (e: ChunkUpdatedEvent) => {
    console.log(
      e.payload.dataSections.palleteBitsPerEntry,
      e.payload.dataSections.pallete,
      e.payload.dataSections.dataArray.map((a: any) => a.toString(2).match(/.{4}/g))
    )
  }
}