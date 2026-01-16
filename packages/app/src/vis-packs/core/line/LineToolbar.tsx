import {
  ComplexVisTypeSelector,
  CurveType,
  DomainWidget,
  ExportMenu,
  Interpolation,
  Menu,
  RadioGroup,
  ScaleSelector,
  Separator,
  ToggleBtn,
  Toolbar,
} from '@h5web/lib';
import {
  type ComplexLineVisType,
  ComplexVisType,
  type Domain,
  type ExportEntry,
} from '@h5web/shared/vis-models';
import { AXIS_SCALE_TYPES } from '@h5web/shared/vis-utils';
import { MdAutoGraph, MdGridOn } from 'react-icons/md';

import { CURVE_TYPE_LABELS, INTERACTIONS_WITH_AXIAL_ZOOM } from '../utils';
import { type LineConfig } from './config';
import ErrorsIcon from './ErrorsIcon';

const COMPLEX_VIS_TYPES: ComplexLineVisType[] = [
  ComplexVisType.Amplitude,
  ComplexVisType.Phase,
  ComplexVisType.PhaseUnwrapped,
];

interface Props {
  dataDomain: Domain;
  isSlice?: boolean;
  isComplex?: boolean;
  withErrors?: boolean;
  config: LineConfig;
  exportEntries?: ExportEntry[];
}

function LineToolbar(props: Props) {
  const { dataDomain, isSlice, isComplex, withErrors, config, exportEntries } =
    props;

  const {
    customDomain,
    curveType,
    showGrid,
    xScaleType,
    yScaleType,
    complexVisType,
    showErrors,
    interpolation,
    setCustomDomain,
    setCurveType,
    toggleGrid,
    setXScaleType,
    setYScaleType,
    setComplexVisType,
    toggleErrors,
    setInterpolation,
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

      {isComplex && (
        <>
          <Separator />
          <ComplexVisTypeSelector
            value={complexVisType}
            onChange={setComplexVisType}
            options={COMPLEX_VIS_TYPES}
          />
        </>
      )}

      <Separator />

      {withErrors && (
        <ToggleBtn
          label="Errors"
          Icon={ErrorsIcon}
          value={showErrors}
          onToggle={toggleErrors}
        />
      )}

      <ToggleBtn
        label="Grid"
        Icon={MdGridOn}
        value={showGrid}
        onToggle={toggleGrid}
      />

      <Menu label="Aspect" Icon={MdAutoGraph}>
        <RadioGroup
          name="curvetype"
          value={curveType}
          options={Object.values(CurveType)}
          optionsLabels={CURVE_TYPE_LABELS}
          onChange={setCurveType}
        />
        <RadioGroup
          name="interpolation"
          label="Interpolation"
          options={Object.values(Interpolation)}
          disabled={curveType === CurveType.GlyphsOnly}
          value={interpolation}
          onChange={setInterpolation}
        />
      </Menu>

      {exportEntries && exportEntries.length > 0 && (
        <>
          <Separator />
          <ExportMenu isSlice={isSlice} entries={exportEntries} />
        </>
      )}
    </Toolbar>
  );
}

export default LineToolbar;
