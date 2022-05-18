import { SmartBuffer } from 'smart-buffer';

export const times = <T>(n: number, cb: () => T): T[] => {
  const result: T[] = [];
  
  for (let i = 0; i < n; i += 1) {
    result.push(cb());
  }

  return result;
}

export const hasGzipHeader = (b: SmartBuffer) => {
  const maybeGzipHead = b.readBuffer(2);
  b.insertBuffer(maybeGzipHead, 0);

  return maybeGzipHead[0] === 0x1f && maybeGzipHead[1] === 0x8b;
}