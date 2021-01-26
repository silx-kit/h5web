import type { ReactElement } from 'react';
import { FiItalic } from 'react-icons/fi';
import { useNxSpectrumConfig } from './config';
import ToggleBtn from '../../../toolbar/controls/ToggleBtn';
import LineToolbar from '../../../toolbar/LineToolbar';

function NxSpectrumToolbar(): ReactElement {
  const { showErrors, toggleErrors, areErrorsDisabled } = useNxSpectrumConfig();

  return (
    <LineToolbar
      errorControl={
        <ToggleBtn
          label="Errors"
          icon={(props) => (
            <FiItalic
              transform="skewX(20)"
              style={{ marginLeft: '-0.25em', marginRight: '0.0625rem' }}
              {...props}
            />
          )}
          value={showErrors}
          onChange={toggleErrors}
          disabled={areErrorsDisabled}
        />
      }
    />
  );
}

export default NxSpectrumToolbar;
