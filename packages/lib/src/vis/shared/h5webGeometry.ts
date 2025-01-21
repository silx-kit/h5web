import { type BufferAttribute, BufferGeometry } from 'three';

abstract class H5WebGeometry<
  AttributeNames extends string,
  Params extends object,
> extends BufferGeometry<Record<AttributeNames, BufferAttribute>> {
  protected params: Params | undefined;

  public prepare(params: Params): void {
    this.params = params;
  }

  public abstract update(index: number): void;
}

export default H5WebGeometry;
