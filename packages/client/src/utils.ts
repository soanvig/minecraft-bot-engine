export const asyncTimes = async <T>(n: number, cb: () => Promise<T>): Promise<T[]> => {
  const result: T[] = [];
  
  for (let i = 0; i < n; i += 1) {
    result.push(await cb());
  }

  return result;
}