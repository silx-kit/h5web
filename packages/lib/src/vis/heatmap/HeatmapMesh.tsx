import { type Domain } from '@h5web/shared/vis-models';
import { type RGBColor } from 'd3-color';
import { type NdArray } from 'ndarray';
import {
  type MagnificationTextureFilter,
  type MinificationTextureFilter,
} from 'three';

import { type VisScaleType } from '../models';
import VisMesh, { type VisMeshProps } from '../shared/VisMesh';
import HeatmapMaterial from './HeatmapMaterial';
import { type ColorMap, type TextureSafeTypedArray } from './models';

interface Props extends VisMeshProps {
  values: NdArray<TextureSafeTypedArray | Uint16Array>; // uint16 values are treated as half floats
  domain: Domain;
  scaleType: VisScaleType;
  colorMap: ColorMap;
  invertColorMap?: boolean;
  alphaValues?: NdArray<TextureSafeTypedArray | Uint16Array>; // uint16 values are treated as half floats
  alphaDomain?: Domain;
  badColor?: RGBColor | string;
  magFilter?: MagnificationTextureFilter;
  minFilter?: MinificationTextureFilter;
  mask?: NdArray<Uint8Array>;
}

function HeatmapMesh(props: Props) {
  const {
    values,
    domain,
    scaleType,
    colorMap,
    invertColorMap,
    alphaValues,
    alphaDomain,
    badColor,
    magFilter,
    minFilter,
    mask,
    ...visMeshProps
  } = props;

  return (
    <VisMesh {...visMeshProps}>
      <HeatmapMaterial
        values={values}
        domain={domain}
        scaleType={scaleType}
        colorMap={colorMap}
        invertColorMap={invertColorMap}
        alphaValues={alphaValues}
        alphaDomain={alphaDomain}
        badColor={badColor}
        magFilter={magFilter}
        minFilter={minFilter}
        mask={mask}
      />
    </VisMesh>
  );
}

export type { Props as HeatmapMeshProps };
export default HeatmapMesh;
