import { Duplex } from 'stream';
import { streamToRx } from 'rxjs-stream';
import { map, Subject, tap } from 'rxjs';

class Socket extends Duplex {
  public _write(data: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    console.log('[Socket] received', data, typeof data);
  }
  
  public _read(size: number): void {
    const data = `{ "key": true }`;
    
    console.log('[Socket] send', data, typeof data);
    
    this.push(data);
    this.push(null);
  }
}

const socket = new Socket({ objectMode: true });
const socketObservable = streamToRx<string>(socket);
const socketWritable = new Subject();

socketWritable.subscribe(value => socket.write(value));

socketObservable.pipe(
  map(value => JSON.parse(value)),
  tap(value => console.log('[Tap] received', value, typeof value)),
  map(value => JSON.stringify(value))
).subscribe(socketWritable);