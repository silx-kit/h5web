import type { NumArray } from '@h5web/shared/vis-models';
import type { PointsProps } from '@react-three/fiber';

import { useGeometry } from '../hooks';
import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import { hasR3FEventHandlers } from '../utils';
import GlyphMaterial from './GlyphMaterial';
import GlyphsGeometry from './glyphsGeometry';
import { GlyphType } from './models';

interface Props extends PointsProps {
  abscissas: NumArray;
  ordinates: NumArray;
  glyphType?: GlyphType;
  color: string;
  size?: number;
  visible?: boolean;
  ignoreValue?: (val: number) => boolean;
}

function Glyphs(props: Props) {
  const {
    abscissas,
    ordinates,
    glyphType = GlyphType.Cross,
    color,
    size = 6,
    visible = true,
    ignoreValue,
    ...pointsProps
  } = props;

  const { abscissaScale, ordinateScale } = useVisCanvasContext();

  const geometry = useGeometry(
    GlyphsGeometry,
    ordinates.length,
    visible && {
      abscissas,
      ordinates,
      abscissaScale,
      ordinateScale,
      ignoreValue,
    },
    hasR3FEventHandlers(pointsProps),
  );

  return (
    <points geometry={geometry} visible={visible} {...pointsProps}>
      <GlyphMaterial glyphType={glyphType} color={color} size={size} />
    </points>
  );
}

export type { Props as GlyphsProps };
export default Glyphs;
