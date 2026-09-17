<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import './relative-time.css';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** The date from which to calculate time from. Defaults to now. */
    date?: Date | string;
    /** The formatting style to use. Defaults to 'long'. */
    format?: 'long' | 'short' | 'narrow';
    /** When 'auto', values like 'yesterday' are used when possible. When 'always', '1 day ago' is used. */
    numeric?: 'always' | 'auto';
    /** Keep the displayed value up to date as time passes. */
    sync?: boolean;
    /** The locale to format with. */
    locale?: string;
    class?: string;
  }

  let {
    date = new Date(),
    format = 'long',
    numeric = 'auto',
    sync = false,
    locale,
    class: className = '',
    ...restProps
  }: Props = $props();

  interface UnitConfig {
    max: number;
    value: number;
    unit: Intl.RelativeTimeFormatUnit;
  }

  const availableUnits: UnitConfig[] = [
    { max: 2760000, value: 60000, unit: 'minute' },
    { max: 72000000, value: 3600000, unit: 'hour' },
    { max: 518400000, value: 86400000, unit: 'day' },
    { max: 2419200000, value: 604800000, unit: 'week' },
    { max: 28512000000, value: 2592000000, unit: 'month' },
    { max: Infinity, value: 31536000000, unit: 'year' },
  ];

  function getTimeUntilNextUnit(unit: 'second' | 'minute' | 'hour' | 'day') {
    const units = { second: 1000, minute: 60000, hour: 3600000, day: 86400000 };
    const value = units[unit];
    return value - (Date.now() % value);
  }

  let tick = $state(0);

  $effect(() => {
    if (!sync) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    function scheduleNext() {
      const parsed = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(parsed.getTime())) return;

      const diff = parsed.getTime() - Date.now();
      const match = availableUnits.find(u => Math.abs(diff) < u.max) || availableUnits[availableUnits.length - 1];
      const unit = match.unit;

      let nextInterval: number;
      if (unit === 'minute') {
        nextInterval = getTimeUntilNextUnit('second');
      } else if (unit === 'hour') {
        nextInterval = getTimeUntilNextUnit('minute');
      } else if (unit === 'day') {
        nextInterval = getTimeUntilNextUnit('hour');
      } else {
        nextInterval = getTimeUntilNextUnit('day');
      }

      timeoutId = setTimeout(() => {
        tick++;
        scheduleNext();
      }, nextInterval);
    }

    scheduleNext();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  });

  let parsedDate = $derived.by(() => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return isNaN(d.getTime()) ? null : d;
  });

  let calculation = $derived.by(() => {
    // Read tick so reactivity triggers if sync is active
    void tick;
    if (!parsedDate) return { text: '', iso: '' };

    const now = Date.now();
    const diff = parsedDate.getTime() - now;
    const match = availableUnits.find(u => Math.abs(diff) < u.max) || availableUnits[availableUnits.length - 1];
    const unit = match.unit;
    const value = match.value;

    try {
      const rtf = new Intl.RelativeTimeFormat(locale || undefined, {
        numeric,
        style: format
      });
      const text = rtf.format(Math.round(diff / value), unit);
      return { text, iso: parsedDate.toISOString() };
    } catch {
      return { text: parsedDate.toLocaleDateString(), iso: parsedDate.toISOString() };
    }
  });
</script>

{#if calculation.text}
  <time datetime={calculation.iso} class="wa-relative-time {className}" {...restProps}>{calculation.text}</time>
{/if}
