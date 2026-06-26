import React from 'react';

export default function MarketingLoading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '24px',
      padding: '24px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ width: 120, height: 24, background: 'var(--color-surface-container-high)', borderRadius: 6 }} />
      <div style={{ width: 300, height: 48, background: 'var(--color-surface-container-high)', borderRadius: 8 }} />
      <div style={{ width: 200, height: 16, background: 'var(--color-surface-container-high)', borderRadius: 6 }} />
      <div style={{ width: 160, height: 48, background: 'var(--color-surface-container-high)', borderRadius: 8 }} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        width: '100%',
        maxWidth: '800px',
        marginTop: '48px',
      }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ height: 160, background: 'var(--color-surface-container-high)', borderRadius: 16 }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
