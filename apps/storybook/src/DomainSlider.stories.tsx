import type { CustomDomain } from '@h5web/lib';
import {
  DomainSlider,
  ScaleType,
  useSafeDomain,
  useVisDomain,
} from '@h5web/lib';
import type { Domain } from '@h5web/shared';
import { COLOR_SCALE_TYPES } from '@h5web/shared';
import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';

import styles from './DomainSlider.stories.module.css';
import { formatDomain } from './utils';

const meta = {
  title: 'Toolbar/DomainSlider',
  component: DomainSlider,
  argTypes: {
    value: { control: false },
    safeVisDomain: { control: false },
    errors: { control: false },
    isAutoMin: { control: false },
    isAutoMax: { control: false },
    scaleType: {
      control: { type: 'inline-radio' },
      options: COLOR_SCALE_TYPES,
    },
  },
} satisfies Meta<typeof DomainSlider>;

export default meta;
type Story = StoryObj<typeof DomainSlider>;

export const Default = {
  render: (args) => {
    const { dataDomain, scaleType, disabled } = args;

    const [customDomain, setCustomDomain] = useState<CustomDomain>([
      null,
      null,
    ]);

    const visDomain = useVisDomain(customDomain, dataDomain);
    const [safeDomain, errors] = useSafeDomain(
      visDomain,
      dataDomain,
      scaleType,
    );

    const [sliderDomain, setSliderDomain] = useState<Domain>(visDomain);
    const isAutoMin = customDomain[0] === null;
    const isAutoMax = customDomain[1] === null;

    useEffect(() => {
      setSliderDomain(visDomain);
    }, [visDomain]);

    return (
      <div className={styles.root}>
        <div className={styles.sliderWrapper}>
          <DomainSlider
            value={sliderDomain}
            safeVisDomain={safeDomain}
            dataDomain={dataDomain}
            scaleType={scaleType}
            errors={errors}
            isAutoMin={isAutoMin}
            isAutoMax={isAutoMax}
            disabled={disabled}
            onChange={setSliderDomain}
            onAfterChange={(hasMinChanged, hasMaxChanged) => {
              setCustomDomain([
                hasMinChanged ? sliderDomain[0] : customDomain[0],
                hasMaxChanged ? sliderDomain[1] : customDomain[1],
              ]);
            }}
          />
        </div>
        <ul>
          <li>
            Data domain: <code>{formatDomain(dataDomain)}</code>
          </li>
          <li>
            Custom domain: <code>{formatDomain(customDomain)}</code>
            <button
              className={styles.resetBtn}
              type="button"
              disabled={isAutoMin && isAutoMax}
              onClick={() => setCustomDomain([null, null])}
            >
              reset
            </button>
          </li>
          <li>
            Slider domain: <code>{formatDomain(sliderDomain)}</code>
          </li>
          <li>
            Vis domain: <code>{formatDomain(visDomain)}</code>
          </li>
        </ul>
      </div>
    );
  },
  args: {
    dataDomain: [4, 400],
    scaleType: ScaleType.Linear,
  },
} satisfies Story;
