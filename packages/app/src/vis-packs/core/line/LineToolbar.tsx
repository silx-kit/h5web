import {
  CurveType,
  ExportMenu,
  ScaleSelector,
  Separator,
  ToggleBtn,
  ToggleGroup,
  Toolbar,
} from '@h5web/lib';
import { ScaleType } from '@h5web/shared';
import { FiItalic } from 'react-icons/fi';
import { MdGridOn, MdDomain } from 'react-icons/md';

import type { ExportFormat } from '../../../providers/models';
import { INTERACTIONS_WITH_AXIAL_ZOOM } from '../utils';
import type { LineConfig } from './config';

const SCALETYPE_OPTIONS = [ScaleType.Linear, ScaleType.Log, ScaleType.SymLog];
const EXPORT_FORMATS: ExportFormat[] = ['npy', 'csv'];

interface Props {
  isSlice: boolean;
  disableAutoScale: boolean;
  disableErrors: boolean;
  config: LineConfig;
  getExportURL: ((format: ExportFormat) => URL | undefined) | undefined;
}

function LineToolbar(props: Props) {
  const { isSlice, disableAutoScale, disableErrors, config, getExportURL } =
    props;

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
    showErrors,
    toggleErrors,
  } = config;

  return (
    <Toolbar interactions={INTERACTIONS_WITH_AXIAL_ZOOM}>
      <ScaleSelector
        label="X"
        value={xScaleType}
        onScaleChange={setXScaleType}
        options={SCALETYPE_OPTIONS}
      />
      <ScaleSelector
        label="Y"
        value={yScaleType}
        onScaleChange={setYScaleType}
        options={SCALETYPE_OPTIONS}
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
        label="Errors"
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

      {getExportURL && (
        <>
          <Separator />
          <ExportMenu
            isSlice={isSlice}
            entries={EXPORT_FORMATS.map((format) => ({
              format,
              url: getExportURL(format),
            }))}
          />
        </>
      )}
    </Toolbar>
  );
}

export default LineToolbar;
