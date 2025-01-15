import Pan, { type PanProps } from '../interactions/Pan';
import SelectToZoom, {
  type SelectToZoomProps,
} from '../interactions/SelectToZoom';
import XAxisZoom, { type XAxisZoomProps } from '../interactions/XAxisZoom';
import YAxisZoom, { type YAxisZoomProps } from '../interactions/YAxisZoom';
import Zoom, { type ZoomProps } from '../interactions/Zoom';
import AxialSelectToZoom, {
  type AxialSelectToZoomProps,
} from './AxialSelectToZoom';

export interface DefaultInteractionsConfig {
  pan?: PanProps | false;
  zoom?: ZoomProps | false;
  xAxisZoom?: XAxisZoomProps | false;
  yAxisZoom?: YAxisZoomProps | false;
  selectToZoom?: SelectToZoomProps | false;
  xSelectToZoom?: Omit<AxialSelectToZoomProps, 'axis'> | false;
  ySelectToZoom?: Omit<AxialSelectToZoomProps, 'axis'> | false;
}

function DefaultInteractions(props: DefaultInteractionsConfig) {
  const { ...interactions } = props;

  return (
    <>
      {interactions.pan !== false && <Pan {...interactions.pan} />}
      {interactions.zoom !== false && <Zoom {...interactions.zoom} />}

      {interactions.xAxisZoom !== false && (
        <XAxisZoom modifierKey="Alt" {...interactions.xAxisZoom} />
      )}
      {interactions.yAxisZoom !== false && (
        <YAxisZoom modifierKey="Shift" {...interactions.yAxisZoom} />
      )}

      {interactions.selectToZoom !== false && (
        <SelectToZoom modifierKey="Control" {...interactions.selectToZoom} />
      )}
      {interactions.xSelectToZoom !== false && (
        <AxialSelectToZoom
          axis="x"
          modifierKey={['Control', 'Alt']}
          {...interactions.xSelectToZoom}
        />
      )}
      {interactions.ySelectToZoom !== false && (
        <AxialSelectToZoom
          axis="y"
          modifierKey={['Control', 'Shift']}
          {...interactions.ySelectToZoom}
        />
      )}
    </>
  );
}

export default DefaultInteractions;
