import { SmartBuffer as OriginalSmartBuffer } from 'smart-buffer';

export class SmartBuffer extends OriginalSmartBuffer {
  public static fromBuffer (buff: Buffer, encoding?: BufferEncoding): SmartBuffer {
    return new this({
      buff,
      encoding,
    });
  }

  /** @TODO add tests */
  public writeVarInt (int: number): SmartBuffer {
    const INT = Math.pow(2, 31);
    const MSB = 0x80;
    const REST = 0x7F;
    const MSBALL = ~REST;

    if (int > Number.MAX_SAFE_INTEGER) {
      throw new RangeError('Could not encode varint');
    }

    const out = [];
    let offset = 0;

    while (int >= INT) {
      out[offset++] = (int & 0xFF) | MSB;
      int /= 128;
    }
    while (int & MSBALL) {
      out[offset++] = (int & 0xFF) | MSB;
      int >>>= 7;
    }
    out[offset] = int | 0;

    this.writeBuffer(Buffer.from(out));

    return this;
  }

  /** @TODO add tests */
  public readVarInt (): number {
    const MSB = 0x80;
    const REST = 0x7F;

    let res = 0;
    let shift = 0;
    let counter = 0;
    let b;
    const buffer = (this as any)._buff;

    do {
      if (shift > 49) {
        throw new RangeError('Could not decode varint');
      }
      b = buffer[this.readOffset + counter];
      counter += 1;
      res += shift < 28
        ? (b & REST) << shift
        : (b & REST) * Math.pow(2, shift);
      shift += 7;
    } while (b >= MSB);

    this.readOffset += counter;

    return res;
  }
}
