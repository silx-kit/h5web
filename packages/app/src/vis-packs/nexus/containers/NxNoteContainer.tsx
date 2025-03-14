import { ScalarVis } from '@h5web/lib';
import {
  assertDataset,
  assertDefined,
  assertGroup,
  assertScalarShape,
  assertStringType,
} from '@h5web/shared/guards';
import { getChildEntity } from '@h5web/shared/hdf5-utils';

import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import NxNoteFetcher from '../NxNoteFetcher';
import { parseJson } from '../utils';

function NxNoteContainer(props: VisContainerProps) {
  const { entity } = props;
  assertGroup(entity);

  const dataDataset = getChildEntity(entity, 'data');
  assertDefined(dataDataset);
  assertDataset(dataDataset);
  assertScalarShape(dataDataset);
  assertStringType(dataDataset);

  const typeDataset = getChildEntity(entity, 'type');
  assertDefined(typeDataset);
  assertDataset(typeDataset);
  assertScalarShape(typeDataset);
  assertStringType(typeDataset);

  return (
    <VisBoundary>
      <NxNoteFetcher
        dataDataset={dataDataset}
        typeDataset={typeDataset}
        render={(value, mimeType) => {
          if (mimeType !== 'application/json') {
            return (
              <div className={visualizerStyles.vis}>
                <p className={visualizerStyles.fallback}>
                  Unsupported mime type
                </p>
              </div>
            );
          }

          const json = parseJson(value);
          return (
            <ScalarVis
              className={visualizerStyles.vis}
              value={JSON.stringify(json, null, 2)}
            />
          );
        }}
      />
    </VisBoundary>
  );
}

export default NxNoteContainer;
