import { merge } from 'lodash';

import Pan from '../interactions/Pan';
import SelectToZoom from '../interactions/SelectToZoom';
import XAxisZoom from '../interactions/XAxisZoom';
import YAxisZoom from '../interactions/YAxisZoom';
import Zoom from '../interactions/Zoom';
import AxialSelectToZoom from './AxialSelectToZoom';
import type { Interactions } from './models';
import { getDefaultInteractions } from './utils';

interface Props {
  interactions?: Interactions;
  keepRatio?: boolean;
}

function DefaultInteractions(props: Props) {
  const { interactions: givenInteractions = {}, keepRatio } = props;

  const parsedInteractions = Object.fromEntries(
    Object.entries(givenInteractions).map(([k, v]) => {
      if (v === true) {
        return [k, {}];
      }

      if (v === false) {
        return [k, null];
      }

      return [k, v];
    })
  );

  const interactions = merge(
    getDefaultInteractions(keepRatio),
    parsedInteractions
  );

  return (
    <>
      {interactions.Pan && <Pan {...interactions.Pan} />}
      {interactions.Zoom && <Zoom {...interactions.Zoom} />}
      {interactions.XAxisZoom && <XAxisZoom {...interactions.XAxisZoom} />}
      {interactions.YAxisZoom && <YAxisZoom {...interactions.YAxisZoom} />}
      {interactions.SelectToZoom && (
        <SelectToZoom {...interactions.SelectToZoom} keepRatio={keepRatio} />
      )}
      {interactions.XSelectToZoom && (
        <AxialSelectToZoom axis="x" {...interactions.XSelectToZoom} />
      )}
      {interactions.YSelectToZoom && (
        <AxialSelectToZoom axis="y" {...interactions.YSelectToZoom} />
      )}
    </>
  );
}

export default DefaultInteractions;
