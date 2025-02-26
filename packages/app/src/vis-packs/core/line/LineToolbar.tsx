import {
  CurveType,
  DomainWidget,
  ExportMenu,
  ScaleSelector,
  Separator,
  ToggleBtn,
  ToggleGroup,
  Toolbar,
} from '@h5web/lib';
import { type Domain, type ExportEntry } from '@h5web/shared/vis-models';
import { AXIS_SCALE_TYPES } from '@h5web/shared/vis-utils';
import { FiItalic } from 'react-icons/fi';
import { MdGridOn } from 'react-icons/md';

import { INTERACTIONS_WITH_AXIAL_ZOOM } from '../utils';
import { type LineConfig } from './config';

interface Props {
  dataDomain: Domain;
  isSlice: boolean;
  disableErrors: boolean;
  config: LineConfig;
  exportEntries: ExportEntry[];
}

function LineToolbar(props: Props) {
  const { isSlice, dataDomain, disableErrors, config, exportEntries } = props;

  const {
    customDomain,
    curveType,
    showGrid,
    xScaleType,
    yScaleType,
    showErrors,
    setCustomDomain,
    setCurveType,
    toggleGrid,
    setXScaleType,
    setYScaleType,
    toggleErrors,
  } = config;

  return (
    <Toolbar interactions={INTERACTIONS_WITH_AXIAL_ZOOM}>
      <DomainWidget
        dataDomain={dataDomain}
        customDomain={customDomain}
        scaleType={yScaleType}
        onCustomDomainChange={setCustomDomain}
      />
      <Separator />

      <ScaleSelector
        label="X"
        value={xScaleType}
        onScaleChange={setXScaleType}
        options={AXIS_SCALE_TYPES}
      />
      <ScaleSelector
        label="Y"
        value={yScaleType}
        onScaleChange={setYScaleType}
        options={AXIS_SCALE_TYPES}
      />

      <Separator />

      <ToggleBtn
        label="Errors"
        // eslint-disable-next-line react/no-unstable-nested-components
        icon={(iconProps) => (
          <FiItalic
            transform="skewX(20)"
            style={{ marginLeft: '-0.25em', marginRight: '0.0625rem' }}
            {...iconProps}
          />
        )}
        value={!disableErrors && showErrors}
        onToggle={toggleErrors}
        disabled={disableErrors}
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

      {exportEntries.length > 0 && (
        <>
          <Separator />
          <ExportMenu isSlice={isSlice} entries={exportEntries} />
        </>
      )}
    </Toolbar>
  );
}

export default LineToolbar;
