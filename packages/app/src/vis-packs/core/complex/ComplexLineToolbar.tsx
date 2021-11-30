import type { ScaleType } from '@h5web/lib';
import {
  Toolbar,
  Separator,
  ToggleBtn,
  ToggleGroup,
  ScaleSelector,
  Selector,
  CurveType,
} from '@h5web/lib';
import { useEffect } from 'react';
import { MdGridOn, MdDomain } from 'react-icons/md';
import shallow from 'zustand/shallow';

import { useLineConfig } from '../line/config';
import { useComplexLineConfig } from './lineConfig';
import type { ComplexLineVisType } from './models';
import { ComplexVisType, VIS_TYPE_SYMBOLS } from './models';

interface Props {
  initialXScaleType: ScaleType | undefined;
  initialYScaleType: ScaleType | undefined;
  disableAutoScale: boolean;
}

function ComplexLineToolbar(props: Props) {
  const { initialXScaleType, initialYScaleType, disableAutoScale } = props;

  const {
    curveType,
    setCurveType,
    showGrid,
    toggleGrid,
    xScaleType,
    setXScaleType,
    yScaleType,
    setYScaleType,
    autoScale,
    toggleAutoScale,
  } = useLineConfig((state) => state, shallow);

  const { visType, setVisType } = useComplexLineConfig(
    (state) => state,
    shallow
  );

  useEffect(() => {
    if (initialXScaleType) {
      setXScaleType(initialXScaleType);
    }
  }, [initialXScaleType, setXScaleType]);

  useEffect(() => {
    if (initialYScaleType) {
      setYScaleType(initialYScaleType);
    }
  }, [initialYScaleType, setYScaleType]);

  return (
    <Toolbar>
      <ScaleSelector
        label="X"
        value={xScaleType}
        onScaleChange={setXScaleType}
      />
      <ScaleSelector
        label="Y"
        value={yScaleType}
        onScaleChange={setYScaleType}
      />

      <Separator />

      <Selector
        value={visType}
        onChange={(value: ComplexLineVisType) => setVisType(value)}
        options={[ComplexVisType.Amplitude, ComplexVisType.Phase]}
        optionComponent={({ option }) => (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>{`${VIS_TYPE_SYMBOLS[option]} ${option}`}</>
        )}
      />

      <Separator />

      <ToggleBtn
        label="Auto-scale"
        icon={MdDomain}
        value={!disableAutoScale && autoScale}
        onToggle={toggleAutoScale}
        disabled={disableAutoScale}
      />

      <ToggleBtn
        label="Grid"
        icon={MdGridOn}
        value={showGrid}
        onToggle={toggleGrid}
      />

      <Separator />

      <ToggleGroup
        role="radiogroup"
        ariaLabel="Curve type"
        value={curveType}
        onChange={(val) => {
          setCurveType(val as CurveType);
        }}
      >
        <ToggleGroup.Btn label="Line" value={CurveType.LineOnly} />
        <ToggleGroup.Btn label="Points" value={CurveType.GlyphsOnly} />
        <ToggleGroup.Btn label="Both" value={CurveType.LineAndGlyphs} />
      </ToggleGroup>
    </Toolbar>
  );
}

export default ComplexLineToolbar;
