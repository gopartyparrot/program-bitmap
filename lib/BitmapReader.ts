export class BitmapReader {
  public static from(buf: Buffer): BitmapReader {
    return new BitmapReader(buf);
  }

  constructor(public data: Uint8Array) {}

  capacity(): number {
    return this.data.length * 8;
  }

  read(index: number): boolean {
    if (index > this.capacity()) {
      throw Error("index overflow");
    }
    const numIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    return ((this.data[numIndex] >> bitIndex) & 1) === 1;
  }

  valuesUtil(index: number): { index: number; value: boolean }[] {
    const values: { index: number; value: boolean }[] = [];
    for (let i = 0; i < index; i++) {
      values.push({
        index: i,
        value: this.read(i),
      });
    }
    return values;
  }

  count(value: boolean): number {
    let count = 0;
    for (let i = 0; i < this.capacity(); i++) {
      if (this.read(i) == value) {
        count++;
      }
    }
    return count;
  }
}

// (function () {
//   const r = BitmapReader.from(Buffer.of(2, 0, 0));
//   console.log(r.count(true));
// })();
