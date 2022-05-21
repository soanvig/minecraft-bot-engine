import { Socket } from 'net';
import { pipe, Observable, OperatorFunction, Subject, Subscription, concatMap, tap, map } from 'rxjs';
import { streamToRx } from 'rxjs-stream';
import { SmartBuffer } from '../SmartBuffer';
import { decodeCompressedPacket, decodePacket, Decoder, encodeCompressedPacket, encodePacket, Encoder, Packet } from './packet';

/**
 * @TODO
 * - Probably unsubscribe from writer somehow
 */
export class PacketManager {
  private socketObservable: Observable<Packet>;
  private writer: Subject<Packet> = new Subject();
  private writerSubscription: Subscription;
  private compressionThreshold = -1;
  private decoder: Decoder;
  private encoder: Encoder;

  constructor (socket: Socket) {
    this.decoder = decodePacket;
    this.encoder = encodePacket;

    this.socketObservable = streamToRx(socket).pipe(
      makeIncomingPacketSplitter(),
      this.makeIncomingPacketParser(),
    );

    this.writerSubscription = this.writer.pipe(
      this.makeOutcomingPacketParser(),
    ).subscribe(buffer => socket.write(buffer));
  }

  public get packets () {
    return this.socketObservable;
  }

  public send (packet: Packet) {
    this.writer.next(packet);
  }

  public setCompressionThreshold (threshold: number) {
    this.compressionThreshold = threshold;

    if (threshold >= 0) {
      this.encoder = encodeCompressedPacket(threshold);
      this.decoder = decodeCompressedPacket(threshold);
    } else {
      this.encoder = encodePacket;
      this.decoder = decodePacket;
    }
  }

  private makeIncomingPacketParser (): OperatorFunction<Buffer, Packet> {
    return pipe(
      concatMap(p => this.decoder(p)),
    );
  }

  private makeOutcomingPacketParser (): OperatorFunction<Packet, Buffer> {
    return pipe(
      concatMap(p => this.encoder(p)),
    );
  }
}

const makeIncomingPacketSplitter = () => {
  let buffer = Buffer.alloc(0);

  return pipe(
    map((chunk: Buffer) => Buffer.concat([buffer, chunk])),
    concatMap((b) => {
      const sb = SmartBuffer.fromBuffer(b);
      const packets = [] as Buffer[];

      while (true) {
        try {
          const length = sb.readVarInt();

          packets.push(sb.readBuffer(length));
        } catch (e) {
          break;
        }
      }

      buffer = sb.readBuffer();

      return packets;
    }),
  )
} 