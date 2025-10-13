import { useClick, useInteractions } from '@floating-ui/react';
import { useId } from 'react';
import { MdAutoGraph } from 'react-icons/md';

import { CurveType, Interpolation } from '../../vis/line/models';
import toolbarStyles from '../Toolbar.module.css';
import Btn from './Btn';
import { useFloatingDismiss, useFloatingMenu } from './hooks';
import RadioGroup from './RadioGroup';

const CURVE_TYPE_LABELS: Record<CurveType, string> = {
  [CurveType.LineOnly]: 'Line',
  [CurveType.GlyphsOnly]: 'Points',
  [CurveType.LineAndGlyphs]: 'Both',
};

interface Props {
  curveType: CurveType;
  onCurveTypeChanged: (curveType: CurveType) => void;
  interpolation: Interpolation;
  onInterpolationChanged: (interpolation: Interpolation) => void;
}

function LineAspectMenu(props: Props) {
  const {
    curveType,
    onCurveTypeChanged,
    interpolation,
    onInterpolationChanged,
  } = props;

  const { context, refs, floatingStyles } = useFloatingMenu();
  const { floatingId, open: isOpen } = context;

  const referenceId = useId();

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useFloatingDismiss(context),
  ]);

  return (
    <>
      <Btn
        ref={refs.setReference}
        id={referenceId}
        label="Aspect"
        Icon={MdAutoGraph}
        withArrow
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={(isOpen && floatingId) || undefined}
        {...getReferenceProps()}
      />

      {isOpen && (
        <div
          ref={refs.setFloating}
          id={floatingId}
          className={toolbarStyles.menu}
          style={floatingStyles}
          role="menu"
          aria-labelledby={referenceId}
          {...getFloatingProps()}
        >
          <RadioGroup
            name="curvetype"
            value={curveType}
            options={Object.values(CurveType)}
            optionsLabels={CURVE_TYPE_LABELS}
            onValueChanged={onCurveTypeChanged}
          />
          <RadioGroup
            name="interpolation"
            label="Interpolation"
            options={Object.values(Interpolation)}
            disabled={curveType === CurveType.GlyphsOnly}
            value={interpolation}
            onValueChanged={onInterpolationChanged}
          />
        </div>
      )}
    </>
  );
}

export default LineAspectMenu;
