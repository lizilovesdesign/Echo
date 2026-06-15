import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const variantClass = styles[variant] || styles.primary;
    const sizeClass = styles[size] || styles.md;
    const buttonClass = `${styles.buttonBase} ${variantClass} ${sizeClass} ${className}`.trim();

    return (
      <button ref={ref} className={buttonClass} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
