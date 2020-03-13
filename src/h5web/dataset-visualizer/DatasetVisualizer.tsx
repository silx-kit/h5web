import React from 'react';
import { HDF5Entity, HDF5Collection } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import { useValue } from '../providers/hooks';
import { isBaseType, isSimpleShape } from '../providers/type-guards';
import TableVis from './TableVis';

interface Props {
  dataset: HDF5Entity<HDF5Collection.Datasets>;
}

function DatasetVisualizer(props: Props): JSX.Element {
  const { dataset } = props;
  const { id, type, shape } = dataset;

  const value = useValue(id);

  return (
    <div className={styles.visualizer}>
      {value &&
      isBaseType(type) &&
      isSimpleShape(shape) &&
      [1, 2].includes(shape.dims.length) ? (
        <TableVis dims={shape.dims} data={value} />
      ) : (
        <pre className={styles.raw}>{JSON.stringify(value)}</pre>
      )}
    </div>
  );
}

export default DatasetVisualizer;
