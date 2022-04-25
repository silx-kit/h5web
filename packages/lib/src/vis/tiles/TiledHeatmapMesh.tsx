import { useThree } from '@react-three/fiber';
import { clamp, range } from 'lodash';

import { getInterpolator } from '../heatmap/utils';
import { useFrameRendering } from '../hooks';
import { useAxisSystemContext } from '../shared/AxisSystemProvider';
import TiledLayer from './TiledLayer';
import type { TilesApi } from './api';
import { useScaledVisibleDomains } from './hooks';
import type { ColorMapProps } from './models';

interface Props extends ColorMapProps {
  api: TilesApi;
  displayLowerResolutions?: boolean;
  qualityFactor?: number;
}

function TiledHeatmapMesh(props: Props) {
  const {
    api,
    displayLowerResolutions = true,
    qualityFactor = 1, // 0: Lower quality, less fetch; 1: Best quality
    ...colorMapProps
  } = props;
  const { baseLayerIndex, baseLayerSize } = api;

  const { visSize } = useAxisSystemContext();
  const { xVisibleDomain, yVisibleDomain } =
    useScaledVisibleDomains(baseLayerSize);
  const canvasSize = useThree((state) => state.size);

  const itemsPerPixel = Math.max(
    1,
    Math.abs(xVisibleDomain[1] - xVisibleDomain[0]) / canvasSize.width,
    Math.abs(yVisibleDomain[1] - yVisibleDomain[0]) / canvasSize.height
  );

  const roundingOffset = 1 - clamp(qualityFactor, 0, 1);
  const subsamplingLevel = Math.min(
    Math.floor(Math.log2(itemsPerPixel) + roundingOffset),
    baseLayerIndex
  );
  const currentLayerIndex = baseLayerIndex - subsamplingLevel;

  // displayLowerResolutions selects which levels of detail layers are displayed:
  // true: lower resolution layers displayed behind the current one
  // false: only current level of detail layer is displayed
  const layers = displayLowerResolutions
    ? range(currentLayerIndex + 1)
    : [currentLayerIndex];

  const { colorMap, invertColorMap = false } = colorMapProps;

  useFrameRendering();

  return (
    <>
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[visSize.width, visSize.height]} />
        <meshBasicMaterial
          color={getInterpolator(colorMap, invertColorMap)(0)}
        />
      </mesh>
      {layers.map((layer) => (
        <TiledLayer key={layer} api={api} layer={layer} {...colorMapProps} />
      ))}
    </>
  );
}

export type { Props as TiledHeatmapMeshProps };
export default TiledHeatmapMesh;
