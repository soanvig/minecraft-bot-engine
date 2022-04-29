import { SmartBuffer as OriginalSmartBuffer } from 'smart-buffer';

export class SmartBuffer extends OriginalSmartBuffer {

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
  public readVarInt = (buf: Buffer): number => {
    const MSB = 0x80;
    const REST = 0x7F;

    let res = 0;
    let shift = 0;
    let counter = 0;
    let b;
    const l = buf.length;

    do {
      if (counter >= l || shift > 49) {
        throw new RangeError('Could not decode varint');
      }
      b = buf[counter++];
      res += shift < 28
        ? (b & REST) << shift
        : (b & REST) * Math.pow(2, shift);
      shift += 7;
    } while (b >= MSB);

    (this as any)._readOffset += counter;

    return res;
  };
}