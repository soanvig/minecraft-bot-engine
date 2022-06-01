export class Vec3 {
  constructor (
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
  ) {}

  public sub(vec: Vec3): Vec3 {
    return new Vec3(
      this.x - vec.x,
      this.y - vec.y,
      this.z - vec.z,
    );
  }

  public add(vec: Vec3): Vec3 {
    return new Vec3(
      this.x + vec.x,
      this.y + vec.y,
      this.z + vec.z,
    );
  }

  public scale(factor: number): Vec3 {
    return new Vec3(
      this.x * factor,
      this.y * factor,
      this.z * factor,
    )
  }

  public norm(): number {
    const sum = Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2);

    return Math.sqrt(sum);
  }
}