'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, User, Plus } from 'lucide-react';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { href: '/home', label: 'Home', Icon: Home },
  { href: '/timeline', label: 'Memories', Icon: BookOpen },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.inner}>
        {/* Left group: Home + Memories */}
        <div className={styles.group}>
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.item} ${isActive ? styles.active : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={styles.icon} size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className={styles.label}>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Centre: Floating Action Button */}
        <Link href="/create" className={styles.fab} aria-label="Create new Echo entry">
          <Plus size={26} strokeWidth={2.5} />
        </Link>

        {/* Right group: Profile */}
        <div className={styles.group}>
          <Link
            href="/profile"
            className={`${styles.item} ${pathname === '/profile' ? styles.active : ''}`}
            aria-current={pathname === '/profile' ? 'page' : undefined}
          >
            <User
              className={styles.icon}
              size={22}
              strokeWidth={pathname === '/profile' ? 2.2 : 1.8}
            />
            <span className={styles.label}>Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
