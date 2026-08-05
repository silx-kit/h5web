import { OrthographicCamera } from 'three';

import { CAMERA_FAR, CAMERA_NEAR, CAMERA_Z } from '../utils';

export class ScaledOrthographicCamera extends OrthographicCamera {
  /* An OrthographicCamera that keeps the scale in matrixWorldInverse (removed in three@0.183) */
  public constructor() {
    super();
    // Customize visible `z` range: https://github.com/silx-kit/h5web/issues/1626
    this.near = CAMERA_NEAR;
    this.far = CAMERA_FAR;
    this.translateZ(CAMERA_Z);
  }

  // https://github.com/mrdoob/three.js/pull/32805/changes
  public override updateMatrixWorld(force?: boolean): void {
    super.updateMatrixWorld(force);
    this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }

  // https://github.com/mrdoob/three.js/pull/32805/changes
  public override updateWorldMatrix(
    updateParents: boolean,
    updateChildren: boolean,
  ): void {
    super.updateWorldMatrix(updateParents, updateChildren);
    this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
}
