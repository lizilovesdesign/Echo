/**
 * Formats an entry timestamp as a fixed calendar date for journal surfaces.
 * Echo intentionally avoids relative times ("3 days ago") so the timeline
 * reads like a permanent diary archive. Output matches Echo's date style:
 * formatEntryDate('2026-09-20') === '20 Sept 2026'
 */
const MONTH_ABBREVIATIONS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function formatEntryDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const day = String(date.getDate()).padStart(2, '0');
  return `${day} ${MONTH_ABBREVIATIONS[date.getMonth()]} ${date.getFullYear()}`;
}
