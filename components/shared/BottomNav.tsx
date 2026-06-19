'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home01Icon, BookOpen01Icon, UserIcon, AddCircleIcon } from 'hugeicons-react';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { href: '/home', label: 'Home', Icon: Home01Icon },
  { href: '/timeline', label: 'Memories', Icon: BookOpen01Icon },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === '/home';

  return (
    <div className={styles.wrapper}>
      {isHome && (
        <Link href="/create" className={styles.fab} aria-label="Create new Echo entry">
          <AddCircleIcon size={28} />
        </Link>
      )}

      <nav className={styles.nav} aria-label="Main navigation">
        <div className={styles.inner}>
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.item} ${isActive ? styles.active : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={styles.icon} size={22} />
                <span className={styles.label}>{label}</span>
              </Link>
            );
          })}

          <Link
            href="/profile"
            className={`${styles.item} ${pathname === '/profile' ? styles.active : ''}`}
            aria-current={pathname === '/profile' ? 'page' : undefined}
          >
            <UserIcon className={styles.icon} size={22} />
            <span className={styles.label}>Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
