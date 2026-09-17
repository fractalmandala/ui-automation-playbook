export type TimeField = 'hour' | 'minute' | 'second' | 'dayPeriod';

export interface TimeSegments {
  hour: number | null;
  minute: number | null;
  second: number | null;
  dayPeriod: 0 | 1 | null; // 0 = AM, 1 = PM
}

export interface WireOptions {
  hour12: boolean;
  withSeconds: boolean;
}

export function resolveHour12(locale: string): boolean {
  try {
    const probe = new Intl.DateTimeFormat(locale || 'en', { hour: 'numeric' });
    return probe.resolvedOptions().hour12 ?? false;
  } catch {
    return false;
  }
}

export function formatDayPeriod(locale: string, period: 0 | 1): string {
  try {
    const formatter = new Intl.DateTimeFormat(locale || 'en', { hour: 'numeric', hour12: true });
    const date = new Date(2026, 0, 1, period === 0 ? 9 : 15);
    const parts = formatter.formatToParts(date);
    const dp = parts.find(p => p.type === 'dayPeriod');
    return dp?.value || (period === 0 ? 'AM' : 'PM');
  } catch {
    return period === 0 ? 'AM' : 'PM';
  }
}

export function isTimeComplete(segments: TimeSegments, opts: WireOptions): boolean {
  if (segments.hour == null || segments.minute == null) return false;
  if (opts.withSeconds && segments.second == null) return false;
  if (opts.hour12 && segments.dayPeriod == null) return false;
  return true;
}

export function timeSegmentsToWire(segments: TimeSegments, opts: WireOptions): string {
  if (!isTimeComplete(segments, opts)) return '';
  let h = segments.hour!;
  if (opts.hour12) {
    if (segments.dayPeriod === 0) {
      h = h === 12 ? 0 : h;
    } else {
      h = h === 12 ? 12 : h + 12;
    }
  }
  const hh = String(h).padStart(2, '0');
  const mm = String(segments.minute!).padStart(2, '0');
  if (opts.withSeconds) {
    const ss = String(segments.second ?? 0).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${hh}:${mm}`;
}

export function wireToTimeSegments(wire: string, opts: WireOptions): TimeSegments {
  if (!wire) return { hour: null, minute: null, second: null, dayPeriod: null };
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(wire);
  if (!match) return { hour: null, minute: null, second: null, dayPeriod: null };
  let h = Number(match[1]);
  const m = Number(match[2]);
  const s = match[3] ? Number(match[3]) : null;
  let dp: 0 | 1 | null = null;
  if (opts.hour12) {
    dp = h < 12 ? 0 : 1;
    h = h % 12 || 12;
  }
  return {
    hour: h,
    minute: m,
    second: s,
    dayPeriod: dp
  };
}
