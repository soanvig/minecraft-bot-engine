import { readFileSync } from 'fs';
import { decodeNBT } from '.';

const input = readFileSync('./debug').slice(8);

console.log(input.length);
console.log(input);

console.log(decodeNBT(input))