import React from 'react';

export default function JournalLoading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px',
      maxWidth: '600px',
      margin: '0 auto',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ height: 40, width: '60%', background: 'var(--color-surface-container-high)', borderRadius: 8 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 60, background: 'var(--color-surface-container-high)', borderRadius: 8 }} />
        ))}
      </div>
      <div style={{ height: 120, background: 'var(--color-surface-container-high)', borderRadius: 12 }} />
      <div style={{ height: 100, background: 'var(--color-surface-container-high)', borderRadius: 12 }} />
      <div style={{ height: 100, background: 'var(--color-surface-container-high)', borderRadius: 12 }} />
      <div style={{ display: 'flex', gap: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 100, background: 'var(--color-surface-container-high)', borderRadius: 12 }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
