import { SmartBuffer } from 'smart-buffer';

export const times = <T>(n: number, cb: () => T): T[] => {
  const result: T[] = [];
  
  for (let i = 0; i < n; i += 1) {
    result.push(cb());
  }

  return result;
}
