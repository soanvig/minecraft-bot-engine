import { SmartBuffer } from 'smart-buffer';

export const times = async <T>(n: number, cb: () => T): Promise<T[]> => {
  const result: T[] = [];
  
  for (let i = 0; i < n; i += 1) {
    result.push(await cb());
  }

  return result;
}

export const hasGzipHeader = (b: SmartBuffer) => {
  const maybeGzipHead = b.readBuffer(2);
  b.insertBuffer(maybeGzipHead, 0);

  return maybeGzipHead[0] === 0x1f && maybeGzipHead[1] === 0x8b;
}