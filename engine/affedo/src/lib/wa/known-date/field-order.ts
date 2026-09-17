export type SegmentField = 'year' | 'month' | 'day';

const orderCache = new Map<string, SegmentField[]>();

export function localeFieldOrder(locale: string): SegmentField[] {
  const key = locale || 'en';
  const cached = orderCache.get(key);
  if (cached) return cached;

  try {
    const formatter = new Intl.DateTimeFormat(key, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      calendar: 'gregory',
      numberingSystem: 'latn',
    });
    const parts = formatter.formatToParts(new Date(2026, 0, 23));

    const order: SegmentField[] = [];
    for (const part of parts) {
      if (part.type === 'year' || part.type === 'month' || part.type === 'day') {
        order.push(part.type);
      }
    }

    const resolved = order.length === 3 ? order : (['month', 'day', 'year'] as SegmentField[]);
    orderCache.set(key, resolved);
    return resolved;
  } catch {
    const fallback: SegmentField[] = ['month', 'day', 'year'];
    orderCache.set(key, fallback);
    return fallback;
  }
}
