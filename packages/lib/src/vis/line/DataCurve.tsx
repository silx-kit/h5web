import { type IgnoreValue, type NumArray } from '@h5web/shared/vis-models';
import { type ThreeEvent } from '@react-three/fiber';
import { type LineMaterialParameters } from 'three/addons/lines/LineMaterial.js';

import ErrorBars from './ErrorBars';
import Glyphs from './Glyphs';
import Line from './Line';
import { CurveType, GlyphType, type Interpolation } from './models';
import { useEventHandler } from './utils';

interface Props {
  abscissas: NumArray;
  ordinates: NumArray;
  errors?: NumArray;
  showErrors?: boolean;
  color: string;
  curveType?: CurveType;
  width?: number;
  interpolation?: Interpolation;
  glyphType?: GlyphType;
  glyphSize?: number;
  materialProps?: LineMaterialParameters;
  visible?: boolean;
  onLineClick?: (index: number, event: ThreeEvent<MouseEvent>) => void;
  onLineEnter?: (index: number, event: ThreeEvent<PointerEvent>) => void;
  onLineLeave?: (index: number, event: ThreeEvent<PointerEvent>) => void;
  onDataPointClick?: (index: number, evt: ThreeEvent<MouseEvent>) => void;
  onDataPointEnter?: (index: number, evt: ThreeEvent<PointerEvent>) => void;
  onDataPointLeave?: (index: number, evt: ThreeEvent<PointerEvent>) => void;
  ignoreValue?: IgnoreValue;
}

function DataCurve(props: Props) {
  const {
    abscissas,
    ordinates,
    errors,
    showErrors = true,
    color,
    width,
    interpolation,
    curveType = CurveType.LineOnly,
    glyphType = GlyphType.Cross,
    glyphSize = 6,
    materialProps = {},
    visible = true,
    onLineClick,
    onLineEnter,
    onLineLeave,
    onDataPointClick,
    onDataPointEnter,
    onDataPointLeave,
    ignoreValue,
  } = props;

  return (
    <>
      <Line
        abscissas={abscissas}
        ordinates={ordinates}
        color={color}
        width={width}
        interpolation={interpolation}
        ignoreValue={ignoreValue}
        materialProps={materialProps}
        visible={curveType !== CurveType.GlyphsOnly && visible}
        onClick={useEventHandler(onLineClick)}
        onPointerEnter={useEventHandler(onLineEnter)}
        onPointerLeave={useEventHandler(onLineLeave)}
      />
      <Glyphs
        abscissas={abscissas}
        ordinates={ordinates}
        glyphType={glyphType}
        color={color}
        size={glyphSize}
        ignoreValue={ignoreValue}
        visible={curveType !== CurveType.LineOnly && visible}
        onClick={useEventHandler(onDataPointClick)}
        onPointerEnter={useEventHandler(onDataPointEnter)}
        onPointerLeave={useEventHandler(onDataPointLeave)}
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
