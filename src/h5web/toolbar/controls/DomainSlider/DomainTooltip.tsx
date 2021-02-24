import { format } from 'd3-format';
import type { ReactElement } from 'react';
import type { Domain } from '../../../../packages/lib';
import ToggleBtn from '../ToggleBtn';
import styles from './DomainSlider.module.css';

const formatter = format('.3~e');

interface Props {
  id: string;
  open: boolean;
  domain: Domain;
  dataDomain: Domain;
  isAutoMin: boolean;
  isAutoMax: boolean;
  onAutoscaleToggle: (toggleMin: boolean, toggleMax: boolean) => void;
}

function DomainTooltip(props: Props): ReactElement {
  const { id, open, domain, dataDomain, isAutoMin, isAutoMax } = props;
  const { onAutoscaleToggle } = props;

  return (
    <div id={id} className={styles.tooltip} role="tooltip" hidden={!open}>
      <div className={styles.tooltipInner}>
        <div className={styles.minMax}>
          <h3>Min</h3>
          <p>
            <abbr title={domain[0].toString()}>{formatter(domain[0])}</abbr>
          </p>
          <h3>Max</h3>
          <p>
            <abbr title={domain[1].toString()}>{formatter(domain[1])}</abbr>
          </p>
        </div>

        <p className={styles.dataRange}>
          Data range{' '}
          <span>
            [{' '}
            <abbr title={dataDomain[0].toString()}>
              {formatter(dataDomain[0])}
            </abbr>{' '}
            ,{' '}
            <abbr title={dataDomain[1].toString()}>
              {formatter(dataDomain[1])}
            </abbr>{' '}
            ]
          </span>
        </p>

        <p className={styles.autoscale}>
          Autoscale{' '}
          <ToggleBtn
            label="Min"
            raised
            value={isAutoMin}
            onChange={() => onAutoscaleToggle(true, false)}
          />
          <ToggleBtn
            label="Max"
            raised
            value={isAutoMax}
            onChange={() => onAutoscaleToggle(false, true)}
          />
        </p>
      </div>
    </div>
  );
}

export default DomainTooltip;
