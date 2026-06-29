'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight01Icon, HeartAddIcon } from 'hugeicons-react';
import { Button } from '@/components/ui/Button';
import styles from '@/app/(marketing)/page.module.css';

export function HeroCta() {
  const router = useRouter();

  return (
    <Button size="md" variant="primary" className={styles.heroCta} onClick={() => router.push('/login?mode=signup')}>
      Join Echo <ArrowRight01Icon size={16} className={styles.arrow} />
    </Button>
  );
}

export function FooterHeart() {
  return <HeartAddIcon size={12} className={styles.heartIcon} />;
}
