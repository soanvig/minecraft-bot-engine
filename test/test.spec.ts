import test from 'ava';
import { helloWorld } from '../src';

test('Hello world', t => {
  t.is(helloWorld(), 'Hello World!');
});
