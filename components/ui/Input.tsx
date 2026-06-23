import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  endAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, endAdornment, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const inputClass = `${styles.inputBase} ${endAdornment ? styles.hasAdornment : ''} ${error ? styles.inputError : ''} ${className}`.trim();

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.inputWrap}>
          <input ref={ref} id={inputId} className={inputClass} {...props} />
          {endAdornment && <span className={styles.adornment}>{endAdornment}</span>}
        </div>
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
