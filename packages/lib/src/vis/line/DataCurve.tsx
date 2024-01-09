import type { NumArray } from '@h5web/shared/vis-models';
import type { ThreeEvent } from '@react-three/fiber';
import { useCallback } from 'react';

import ErrorBars from './ErrorBars';
import Glyphs from './Glyphs';
import Line from './Line';
import { CurveType, GlyphType } from './models';

interface Props {
  abscissas: NumArray;
  ordinates: NumArray;
  errors?: NumArray;
  showErrors?: boolean;
  color: string;
  curveType?: CurveType;
  glyphType?: GlyphType;
  glyphSize?: number;
  visible?: boolean;
  onDataPointClick?: (index: number, evt: ThreeEvent<MouseEvent>) => void;
  onDataPointEnter?: (index: number, evt: ThreeEvent<PointerEvent>) => void;
  onDataPointLeave?: (index: number, evt: ThreeEvent<PointerEvent>) => void;
  ignoreValue?: (val: number) => boolean;
}

function DataCurve(props: Props) {
  const {
    abscissas,
    ordinates,
    errors,
    showErrors,
    color,
    curveType = CurveType.LineOnly,
    glyphType = GlyphType.Cross,
    glyphSize = 6,
    visible = true,
    onDataPointClick,
    onDataPointEnter,
    onDataPointLeave,
    ignoreValue,
  } = props;

  const handleClick = useCallback(
    (evt: ThreeEvent<MouseEvent>) => {
      const { index } = evt;

      if (onDataPointClick && index !== undefined) {
        onDataPointClick(index, evt);
      }
    },
    [onDataPointClick],
  );

  const handlePointerEnter = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { index } = evt;

      if (onDataPointEnter && index !== undefined) {
        onDataPointEnter(index, evt);
      }
    },
    [onDataPointEnter],
  );

  const handlePointerLeave = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { index } = evt;

      if (onDataPointLeave && index !== undefined) {
        onDataPointLeave(index, evt);
      }
    },
    [onDataPointLeave],
  );

  return (
    <>
      <Line
        abscissas={abscissas}
        ordinates={ordinates}
        color={color}
        ignoreValue={ignoreValue}
        visible={curveType !== CurveType.GlyphsOnly && visible}
      />
      <Glyphs
        abscissas={abscissas}
        ordinates={ordinates}
        glyphType={glyphType}
        color={color}
        size={glyphSize}
        ignoreValue={ignoreValue}
        visible={curveType !== CurveType.LineOnly && visible}
        onClick={onDataPointClick && handleClick}
        onPointerEnter={onDataPointEnter && handlePointerEnter}
        onPointerLeave={onDataPointLeave && handlePointerLeave}
      />
      {errors && (
        <ErrorBars
          abscissas={abscissas}
          ordinates={ordinates}
          errors={errors}
          color={color}
          ignoreValue={ignoreValue}
          visible={visible && showErrors}
        />
      )}
    </>
  );
}

export type { Props as DataCurveProps };
export default DataCurve;
