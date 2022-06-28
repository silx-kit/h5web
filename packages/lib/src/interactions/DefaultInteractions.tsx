import Pan from '../interactions/Pan';
import type { PanProps } from '../interactions/Pan';
import SelectToZoom from '../interactions/SelectToZoom';
import type { SelectToZoomProps } from '../interactions/SelectToZoom';
import XAxisZoom from '../interactions/XAxisZoom';
import type { XAxisZoomProps } from '../interactions/XAxisZoom';
import YAxisZoom from '../interactions/YAxisZoom';
import type { YAxisZoomProps } from '../interactions/YAxisZoom';
import Zoom from '../interactions/Zoom';
import type { ZoomProps } from '../interactions/Zoom';
import AxialSelectToZoom from './AxialSelectToZoom';
import type { AxialSelectToZoomProps } from './AxialSelectToZoom';

export interface DefaultInteractionsConfig {
  pan?: PanProps | false;
  zoom?: ZoomProps | false;
  xAxisZoom?: XAxisZoomProps | false;
  yAxisZoom?: YAxisZoomProps | false;
  selectToZoom?: Omit<SelectToZoomProps, 'keepRatio'> | false;
  xSelectToZoom?: Omit<AxialSelectToZoomProps, 'axis'> | false;
  ySelectToZoom?: Omit<AxialSelectToZoomProps, 'axis'> | false;
}

interface Props extends DefaultInteractionsConfig {
  keepRatio?: boolean;
}

function DefaultInteractions(props: Props) {
  const { keepRatio, ...interactions } = props;

  return (
    <>
      {interactions.pan !== false && <Pan {...interactions.pan} />}
      {interactions.zoom !== false && <Zoom {...interactions.zoom} />}

      {interactions.xAxisZoom !== false && (
        <XAxisZoom
          modifierKey="Alt"
          disabled={keepRatio}
          {...interactions.xAxisZoom}
        />
      )}
      {interactions.yAxisZoom !== false && (
        <YAxisZoom
          modifierKey="Shift"
          disabled={keepRatio}
          {...interactions.yAxisZoom}
        />
      )}

      {interactions.selectToZoom !== false && (
        <SelectToZoom
          keepRatio={keepRatio}
          modifierKey="Control"
          {...interactions.selectToZoom}
        />
      )}
      {interactions.xSelectToZoom !== false && (
        <AxialSelectToZoom
          axis="x"
          modifierKey={['Control', 'Alt']}
          disabled={keepRatio}
          {...interactions.xSelectToZoom}
        />
      )}
      {interactions.ySelectToZoom !== false && (
        <AxialSelectToZoom
          axis="y"
          modifierKey={['Control', 'Shift']}
          disabled={keepRatio}
          {...interactions.ySelectToZoom}
        />
      )}
    </>
  );
}

export type { Props as DefaultInteractionsProps };
export default DefaultInteractions;
