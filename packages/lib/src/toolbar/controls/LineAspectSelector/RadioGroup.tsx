import styles from './RadioGroup.module.css';

interface Props<T extends string> {
  value: T;
  onValueChanged: (value: T) => void;
  name: string;
  options: T[];
  optionsLabels?: Record<T, string>;
  label?: string;
  disabled?: boolean;
}

function RadioGroup<T extends string>(props: Props<T>) {
  const {
    value,
    onValueChanged,
    name,
    options,
    optionsLabels,
    label,
    disabled,
  } = props;

  return (
    <div className={styles.group} role="radiogroup">
      {label && <span className={styles.groupLabel}>{label}</span>}
      {options.map((option) => {
        return (
          <label
            id={`${option}-label`}
            key={option}
            className={styles.option}
            htmlFor={option}
            aria-disabled={disabled}
          >
            <input
              id={option}
              name={name}
              type="radio"
              checked={option === value}
              onChange={() => onValueChanged(option)}
              aria-labelledby={`${option}-label`}
            />
            <span className={styles.optionText}>
              {optionsLabels ? optionsLabels[option] : option}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default RadioGroup;
