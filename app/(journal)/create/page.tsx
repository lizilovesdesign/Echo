'use client';

import React, { Suspense } from 'react';
import { EchoEntryForm } from '@/components/journal/EchoEntryForm';
import { Spinner } from '@/components/ui/Spinner';

function CreateEntryFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60dvh' }}>
      <Spinner size="md" />
    </div>
  );
}

export default function CreateEntryPage() {
  return (
    <Suspense fallback={<CreateEntryFallback />}>
      <EchoEntryForm />
    </Suspense>
  );
}
