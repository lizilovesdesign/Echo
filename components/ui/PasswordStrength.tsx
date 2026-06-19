'use client';

import React from 'react';
import styles from './PasswordStrength.module.css';

interface PasswordStrengthProps {
  password: string;
}

function getPasswordStrength(password: string): { label: string; score: number } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-zA-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  const labels = ['', 'Weak', 'Fair', 'Medium', 'Strong', 'Very Strong'];
  return { label: labels[score] || '', score: Math.min(score, 5) };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { label, score } = getPasswordStrength(password);

  return (
    <div className={styles.indicator}>
      <div className={styles.header}>
        <span className={styles.labelText}>Password Strength</span>
        <span className={styles.badge} data-level={score}>{label}</span>
      </div>
      <div className={styles.track}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`${styles.segment} ${i <= score ? styles.active : ''}`}
            data-level={score}
          />
        ))}
      </div>
    </div>
  );
}
