import type { ModifierKey } from '../models';
import PanMesh from './PanMesh';
import ZoomMesh from './ZoomMesh';

interface Props {
  pan?: boolean;
  zoom?: boolean;
  xZoom?: boolean;
  yZoom?: boolean;
  panKey?: ModifierKey;
  xZoomKey?: ModifierKey;
  yZoomKey?: ModifierKey;
}

function PanZoomMesh(props: Props) {
  const { pan = true, panKey, zoom = true, ...zoomProps } = props;

  return (
    <>
      <PanMesh disabled={!pan} modifierKey={panKey} />
      <ZoomMesh disabled={!zoom} {...zoomProps} />
    </>
  );
}

export type { Props as PanZoomProps };
export default PanZoomMesh;
