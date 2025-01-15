import { type Domain } from '@h5web/shared/vis-models';

import { type Scale } from '../../../vis/models';
import styles from './Track.module.css';

interface Props {
  scale: Scale;
  dataDomain: Domain;
}

function Track(props: Props) {
  const { scale, dataDomain } = props;

  const [min, max] = dataDomain;
  const cssScale = scale.copy().range([0, 100]) as Scale;

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
