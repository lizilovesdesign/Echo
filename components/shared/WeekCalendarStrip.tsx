'use client';

import React, { useMemo } from 'react';
import styles from './WeekCalendarStrip.module.css';

const DAY_ABBREVS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDays(today: Date): Array<{ dayAbbrev: string; date: number; fullDate: Date }> {
  // Always show a 7-day window: 3 days before today, today, 3 days after
  const days: Array<{ dayAbbrev: string; date: number; fullDate: Date }> = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      dayAbbrev: DAY_ABBREVS[d.getDay()],
      date: d.getDate(),
      fullDate: d,
    });
  }
  return days;
}

export function WeekCalendarStrip() {
  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => getWeekDays(today), [today]);

  return (
    <section className={styles.strip} aria-label="Weekly calendar">
      <div className={styles.days}>
        {days.map(({ dayAbbrev, date, fullDate }) => {
          const isToday =
            fullDate.getDate() === today.getDate() &&
            fullDate.getMonth() === today.getMonth() &&
            fullDate.getFullYear() === today.getFullYear();

          return (
            <div
              key={fullDate.toISOString()}
              className={`${styles.dayCell} ${isToday ? styles.todayCell : ''}`}
              aria-current={isToday ? 'date' : undefined}
            >
              <span className={styles.dayAbbrev}>{dayAbbrev}</span>
              <span className={styles.dayNumber}>{date}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
