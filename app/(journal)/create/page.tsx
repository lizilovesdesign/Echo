'use client';

import React, { Suspense } from 'react';
import { EchoEntryForm } from '@/components/journal/EchoEntryForm';
import { Spinner } from '@/components/ui/Spinner';
import styles from './page.module.css';

function CreateEntryFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60dvh' }}>
      <Spinner size="md" />
    </div>
  );
}

export default function CreateEntryPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<CreateEntryFallback />}>
        <EchoEntryForm />
      </Suspense>
    </div>
  );
}
