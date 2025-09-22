import {
  ComplexVisTypeSelector,
  CurveType,
  DomainWidget,
  ExportMenu,
  ScaleSelector,
  Separator,
  ToggleBtn,
  ToggleGroup,
  Toolbar,
} from '@h5web/lib';
import {
  ComplexVisType,
  type Domain,
  type ExportEntry,
} from '@h5web/shared/vis-models';
import { AXIS_SCALE_TYPES } from '@h5web/shared/vis-utils';
import { FiGitPullRequest } from 'react-icons/fi';
import { MdGridOn } from 'react-icons/md';

import { INTERACTIONS_WITH_AXIAL_ZOOM } from '../utils';
import { type LineConfig } from './config';
import ErrorsIcon from './ErrorsIcon';

interface Props {
  dataDomain: Domain;
  isSlice?: boolean;
  isComplex?: boolean;
  disableErrors?: boolean;
  config: LineConfig;
  exportEntries?: ExportEntry[];
}

function LineToolbar(props: Props) {
  const {
    dataDomain,
    isSlice,
    isComplex,
    disableErrors,
    config,
    exportEntries,
  } = props;

  const {
    customDomain,
    curveType,
    showGrid,
    xScaleType,
    yScaleType,
    complexVisType,
    showErrors,
    piecewiseConstant,
    setCustomDomain,
    setCurveType,
    toggleGrid,
    setXScaleType,
    setYScaleType,
    setComplexVisType,
    toggleErrors,
    togglePiecewiseContant,
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
            options={[ComplexVisType.Amplitude, ComplexVisType.Phase]}
          />
        </>
      )}

      <Separator />

      {!isComplex && (
        <ToggleBtn
          label="Errors"
          Icon={ErrorsIcon}
          value={!disableErrors && showErrors}
          onToggle={toggleErrors}
          disabled={disableErrors}
        />
      )}

      <ToggleBtn
        label="Grid"
        Icon={MdGridOn}
        value={showGrid}
        onToggle={toggleGrid}
      />

      <ToggleBtn
        label="PiecewiseConstant"
        Icon={FiGitPullRequest}
        value={piecewiseConstant}
        onToggle={togglePiecewiseContant}
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
