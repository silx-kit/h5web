import type { ReactElement } from 'react';
import type { Domain } from '../../../../packages/lib';
import { formatValue } from '../../../utils';
import { DomainError, DomainErrors } from '../../../vis-packs/core/models';
import ToggleBtn from '../ToggleBtn';
import BoundEditor from './BoundEditor';
import styles from './DomainTooltip.module.css';
import ErrorMessage from './ErrorMessage';

interface Props {
  id: string;
  open: boolean;
  sliderDomain: Domain;
  dataDomain: Domain;
  errors: DomainErrors;
  isAutoMin: boolean;
  isAutoMax: boolean;
  onAutoMinToggle: () => void;
  onAutoMaxToggle: () => void;
  isEditingMin: boolean;
  isEditingMax: boolean;
  onEditMin: (force: boolean) => void;
  onEditMax: (force: boolean) => void;
  onChangeMin: (val: number) => void;
  onChangeMax: (val: number) => void;
  onSwap: () => void;
}

function DomainTooltip(props: Props): ReactElement {
  const { id, open, sliderDomain, dataDomain, errors } = props;
  const { isAutoMin, isAutoMax, isEditingMin, isEditingMax } = props;
  const {
    onAutoMinToggle,
    onAutoMaxToggle,
    onEditMin,
    onEditMax,
    onChangeMin,
    onChangeMax,
    onSwap,
  } = props;

  const { minGreater, minError, maxError } = errors;

  return (
    <div
      id={id}
      className={styles.tooltip}
      role="dialog"
      aria-label="Edit domain"
      hidden={!open}
    >
      <div className={styles.tooltipInner}>
        {minGreater && (
          <ErrorMessage
            error={DomainError.MinGreater}
            showSwapBtn={!isAutoMin && !isAutoMax}
            onSwap={onSwap}
          />
        )}

        <BoundEditor
          bound="min"
          value={sliderDomain[0]}
          isEditing={isEditingMin}
          hasError={minGreater || !!minError}
          onEditToggle={onEditMin}
          onChange={onChangeMin}
        />
        {minError && <ErrorMessage error={minError} />}

        <BoundEditor
          bound="max"
          value={sliderDomain[1]}
          isEditing={isEditingMax}
          hasError={minGreater || !!maxError}
          onEditToggle={onEditMax}
          onChange={onChangeMax}
        />
        {maxError && <ErrorMessage error={maxError} />}

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
      </div>
    </div>
  );
}

export default DomainTooltip;
