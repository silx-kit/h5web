import React from 'react';

interface Button {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

interface Props {
  buttons: Button[];
  className?: string;
  buttonClassName?: string;
  ariaLabel?: string;
}

function ButtonGroup(props: Props): JSX.Element {
  const { buttons, className, buttonClassName, ariaLabel } = props;

  if (buttons.length === 0) {
    return <></>;
  }

  return (
    <div role="radiogroup" className={className} aria-label={ariaLabel}>
      {buttons.map(button => {
        return (
          <button
            key={Math.random()}
            type="button"
            role="radio"
            className={buttonClassName}
            aria-checked={button.isSelected}
            onClick={button.onClick}
          >
            {button.label}
          </button>
        );
      })}
    </div>
  );
}

export default ButtonGroup;
