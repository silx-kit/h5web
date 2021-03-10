import type { ReactElement } from 'react';
import type { Domain } from '../../../../packages/lib';
import { formatValue } from '../../../utils';
import type { DomainErrors } from '../../../vis-packs/core/models';
import ToggleBtn from '../ToggleBtn';
import BoundErrorMessage from './BoundErrorMessage';
import styles from './DomainTooltip.module.css';

interface Props {
  id: string;
  open: boolean;
  domain: Domain;
  dataDomain: Domain;
  errors: DomainErrors;
  isAutoMin: boolean;
  isAutoMax: boolean;
  onAutoMinToggle: () => void;
  onAutoMaxToggle: () => void;
}

function DomainTooltip(props: Props): ReactElement {
  const { id, open, domain, dataDomain, errors, isAutoMin, isAutoMax } = props;
  const { onAutoMinToggle, onAutoMaxToggle } = props;
  const { minError, maxError } = errors;

  return (
    <div id={id} className={styles.tooltip} role="tooltip" hidden={!open}>
      <div className={styles.tooltipInner}>
        <div className={styles.minMax}>
          <h3>Min</h3>
          <p className={styles.value} data-error={minError || undefined}>
            <abbr title={domain[0].toString()}>{formatValue(domain[0])}</abbr>
          </p>
          <h3>Max</h3>
          <p className={styles.value} data-error={maxError || undefined}>
            <abbr title={domain[1].toString()}>{formatValue(domain[1])}</abbr>
          </p>
        </div>

        <p className={styles.dataRange}>
          Data range{' '}
          <span>
            [{' '}
            <abbr title={dataDomain[0].toString()}>
              {formatValue(dataDomain[0])}
            </abbr>{' '}
            ,{' '}
            <abbr title={dataDomain[1].toString()}>
              {formatValue(dataDomain[1])}
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
            onChange={onAutoMinToggle}
          />
          <ToggleBtn
            label="Max"
            raised
            value={isAutoMax}
            onChange={onAutoMaxToggle}
          />
        </p>

        {minError && <BoundErrorMessage bound="min" error={minError} />}
        {maxError && <BoundErrorMessage bound="max" error={maxError} />}
      </div>
    </div>
  );
}

export default DomainTooltip;
