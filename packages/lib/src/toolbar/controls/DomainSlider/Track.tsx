import type { Domain } from '@h5web/shared';

import type { AxisScale } from '../../../vis/models';
import styles from './Track.module.css';

interface Props {
  scale: AxisScale;
  dataDomain: Domain;
}

function Track(props: Props) {
  const { scale, dataDomain } = props;

  const [min, max] = dataDomain;
  const cssScale = scale.copy().range([0, 100]) as AxisScale;

  return (
    <div className={styles.track}>
      <div
        className={styles.dataTrack}
        style={{
          left: `${cssScale(min)}%`,
          right: `${100 - cssScale(max)}%`,
        }}
      />
    </div>
  );
}

export default Track;
