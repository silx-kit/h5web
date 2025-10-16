import styles from './RadioGroup.module.css';

interface Props<T extends string> {
  name: string;
  label?: string;
  options: T[];
  optionsLabels?: Record<T, string>;
  disabled?: boolean;
  value: T;
  onChange: (value: T) => void;
}

function RadioGroup<T extends string>(props: Props<T>) {
  const { name, label, options, optionsLabels, disabled, value, onChange } =
    props;

  return (
    <>
      {label && <span className={styles.label}>{label}</span>}

      <div className={styles.options} role="radiogroup">
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
                onChange={() => onChange(option)}
                aria-labelledby={`${option}-label`}
              />
              <span className={styles.optionText}>
                {optionsLabels ? optionsLabels[option] : option}
              </span>
            </label>
          );
        })}
      </div>
    </>
  );
}

export default RadioGroup;
