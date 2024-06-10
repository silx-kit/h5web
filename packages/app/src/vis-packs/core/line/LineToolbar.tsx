import type { Domain } from '@h5web/lib';
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
import { AXIS_SCALE_TYPES } from '@h5web/shared/vis-utils';
import { FiItalic } from 'react-icons/fi';
import { MdGridOn } from 'react-icons/md';

import type { ExportFormat, ExportURL } from '../../../providers/models';
import { INTERACTIONS_WITH_AXIAL_ZOOM } from '../utils';
import type { LineConfig } from './config';

const EXPORT_FORMATS: ExportFormat[] = ['npy', 'csv'];

interface Props {
  dataDomain: Domain;
  isSlice: boolean;
  disableErrors: boolean;
  config: LineConfig;
  getExportURL: ((format: ExportFormat) => ExportURL) | undefined;
}

function LineToolbar(props: Props) {
  const { isSlice, dataDomain, disableErrors, config, getExportURL } = props;

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
