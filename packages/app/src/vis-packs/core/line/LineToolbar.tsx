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
import { MdGridOn, MdLegendToggle } from 'react-icons/md';

import { INTERACTIONS_WITH_AXIAL_ZOOM } from '../utils';
import { type LineConfig } from './config';
import ErrorsIcon from './ErrorsIcon';

interface Props {
  dataDomain: Domain;
  isSlice?: boolean;
  isComplex?: boolean;
  withErrors?: boolean;
  withAux?: boolean;
  config: LineConfig;
  exportEntries?: ExportEntry[];
}

function LineToolbar(props: Props) {
  const {
    dataDomain,
    isSlice,
    isComplex,
    withErrors,
    withAux,
    config,
    exportEntries,
  } = props;

  const {
    customDomain,
    xScaleType,
    yScaleType,
    complexVisType,
    showErrors,
    showAux,
    showGrid,
    curveType,
    setCustomDomain,
    setXScaleType,
    setYScaleType,
    setComplexVisType,
    toggleAux,
    toggleErrors,
    toggleGrid,
    setCurveType,
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

      {withErrors && (
        <ToggleBtn
          label="Errors"
          Icon={ErrorsIcon}
          value={showErrors}
          onToggle={toggleErrors}
        />
      )}

      {withAux && (
        <ToggleBtn
          label="Aux"
          Icon={MdLegendToggle}
          value={showAux}
          onToggle={toggleAux}
        />
      )}

      <ToggleBtn
        label="Grid"
        Icon={MdGridOn}
        value={showGrid}
        onToggle={toggleGrid}
      />

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
