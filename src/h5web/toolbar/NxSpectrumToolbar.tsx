import React, { ReactElement } from 'react';
import { FiItalic } from 'react-icons/fi';
import { useNxSpectrumConfig } from '../visualizations/nexus/config';
import ToggleBtn from './controls/ToggleBtn';
import LineToolbar from './LineToolbar';

function NxSpectrumToolbar(): ReactElement {
  const { showErrors, toggleErrors, areErrorsDisabled } = useNxSpectrumConfig();

  return (
    <LineToolbar>
      <ToggleBtn
        label="Errors"
        icon={(props) => <FiItalic transform="skewX(20)" {...props} />}
        value={showErrors}
        onChange={toggleErrors}
        disabled={areErrorsDisabled}
      />
    </LineToolbar>
  );
}

export default NxSpectrumToolbar;
