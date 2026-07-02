'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MusicNote01Icon, Home01Icon, BookOpen01Icon, UserIcon, AddCircleIcon } from 'hugeicons-react';
import styles from './BottomNav.module.css';

const BOTTOM_ITEMS = [
  { href: '/home', label: 'Home', Icon: Home01Icon },
  { href: '/timeline', label: 'Memories', Icon: BookOpen01Icon },
  { href: '/profile', label: 'Profile', Icon: UserIcon },
] as const;

const SIDEBAR_ITEMS = [
  { href: '/home', label: 'Home', Icon: Home01Icon },
  { href: '/timeline', label: 'Memories', Icon: BookOpen01Icon },
  { href: '/create', label: 'Create', Icon: AddCircleIcon },
  { href: '/profile', label: 'Profile', Icon: UserIcon },
] as const;

function NavItem({ href, label, Icon, isActive }: { href: string; label: string; Icon: React.FC<{ size?: number }>; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`${styles.sidebarItem} ${isActive ? styles.active : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon size={22} />
      <span>{label}</span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === '/home';

  const checkActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <nav className={styles.sidebar} aria-label="Main navigation">
        <Link href="/home" className={styles.logo}>
          <MusicNote01Icon size={24} />
          Echo
        </Link>
        <div className={styles.sidebarItems}>
          {SIDEBAR_ITEMS.map((item) => (
            <NavItem key={item.href} {...item} isActive={checkActive(item.href)} />
          ))}
        </div>
      </nav>

      <div className={styles.wrapper}>
        {isHome && (
          <Link href="/create" className={styles.fab} aria-label="Create new Echo entry">
            <AddCircleIcon size={28} />
          </Link>
        )}

        <nav className={styles.nav} aria-label="Main navigation">
          <div className={styles.inner}>
            {BOTTOM_ITEMS.map(({ href, label, Icon }) => {
              const isActive = checkActive(href);
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
          </div>
        </nav>
      </div>
    </>
  );
}
