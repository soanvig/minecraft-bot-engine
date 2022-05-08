import { Socket } from 'net';
import { pipe, Observable, OperatorFunction, Subject, Subscription, concatMap, ObservableInput, tap } from 'rxjs';
import { streamToRx } from 'rxjs-stream';
import { decodeCompressedPacket, decodePacket, encodeCompressedPacket, encodePacket, Packet } from './packet';

/**
 * @TODO
 * - Probably unsubscribe from writer somehow
 */
export class PacketManager {
  private socketObservable: Observable<Packet>;
  private writer: Subject<Packet> = new Subject();
  private writerSubscription: Subscription;
  private compressionThreshold = -1;

  constructor (socket: Socket) {
    this.socketObservable = streamToRx(socket).pipe(
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
  }

  private isCompressionEnabled () {
    return this.compressionThreshold >= 0;
  }

  private makeIncomingPacketParser (): OperatorFunction<Buffer, Packet> {
    const conditionalDecoder = iifProject(
      () => this.isCompressionEnabled(),
      p => decodeCompressedPacket(this.compressionThreshold, p),
      decodePacket,
    );

    return pipe(
      concatMap(conditionalDecoder),
    );
  }

  private makeOutcomingPacketParser (): OperatorFunction<Packet, Buffer> {
    const conditionalEncoder = iifProject(
      () => this.isCompressionEnabled(),
      p => encodeCompressedPacket(this.compressionThreshold, p),
      encodePacket,
    );

    return pipe(
      concatMap(conditionalEncoder),
    );
  }
}

const iifProject = <V, T, F>(
  cond: (v: V) => boolean,
  trueResult: (v: V) => ObservableInput<T>,
  falseResult: (v: V) => ObservableInput<F>,
): (v: V) => ObservableInput<T> | ObservableInput<F> => {
  return value => {
    if (cond(value)) {
      return trueResult(value);
    } else {
      return falseResult(value);
    }
  };
};

const defer = <T>(f: () => T): T => f();