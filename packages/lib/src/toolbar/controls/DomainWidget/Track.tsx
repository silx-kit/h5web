import { type Domain } from '@h5web/shared/vis-models';
import { type PropsWithChildren, type Ref } from 'react';

import { type Scale } from '../../../vis/models';
import styles from './Track.module.css';

interface Props extends PropsWithChildren {
  ref?: Ref<HTMLDivElement>;
  scale: Scale;
  dataDomain: Domain;
}

function Track(props: Props) {
  const { ref, scale, dataDomain, children } = props;

  const [min, max] = dataDomain;
  const cssScale = scale.copy().range([0, 100]);

  return (
    <div ref={ref} className={styles.track}>
      <div className={styles.crop}>
        <div
          className={styles.dataTrack}
          style={{
            left: `${cssScale(min)}%`,
            right: `${100 - cssScale(max)}%`,
          }}
        />
      </div>
      {children}
    </div>
  );
}

export default Track;
