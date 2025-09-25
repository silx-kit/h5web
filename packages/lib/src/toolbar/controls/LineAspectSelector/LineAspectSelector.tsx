import { useClick, useInteractions } from '@floating-ui/react';
import { useId } from 'react';
import { MdArrowDropDown, MdAutoGraph } from 'react-icons/md';

import { CurveType, Interpolation } from '../../../vis/line/models';
import toolbarStyles from '../../Toolbar.module.css';
import { useFloatingDismiss, useFloatingMenu } from '../hooks';
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

function LineAspectSelector(props: Props) {
  const {
    curveType,
    onCurveTypeChanged,
    interpolation,
    onInterpolationChanged,
  } = props;

  const { context, refs, floatingStyles } = useFloatingMenu();
  const { open: isOpen, floatingId } = context;

  const referenceId = useId();

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useFloatingDismiss(context),
  ]);

  return (
    <>
      <button
        ref={refs.setReference}
        id={referenceId}
        className={toolbarStyles.btn}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={(isOpen && floatingId) || undefined}
        {...getReferenceProps()}
      >
        <span className={toolbarStyles.btnLike}>
          <MdAutoGraph className={toolbarStyles.icon} />
          Aspect
          <MdArrowDropDown className={toolbarStyles.arrowIcon} />
        </span>
      </button>

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
            value={interpolation}
            options={Object.values(Interpolation)}
            label="Interpolation"
            onValueChanged={onInterpolationChanged}
            disabled={curveType === CurveType.GlyphsOnly}
          />
        </div>
      )}
    </>
  );
}

export default LineAspectSelector;
