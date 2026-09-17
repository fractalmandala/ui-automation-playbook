<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import './format-date.css';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** The date/time to format. If not set, the current date and time will be used. */
    date?: Date | string;
    /** The locale to use. If not specified, the document or runtime locale is used. */
    locale?: string;
    /** The format for displaying the weekday. */
    weekday?: 'narrow' | 'short' | 'long';
    /** The format for displaying the era. */
    era?: 'narrow' | 'short' | 'long';
    /** The format for displaying the year. */
    year?: 'numeric' | '2-digit';
    /** The format for displaying the month. */
    month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';
    /** The format for displaying the day. */
    day?: 'numeric' | '2-digit';
    /** The format for displaying the hour. */
    hour?: 'numeric' | '2-digit';
    /** The format for displaying the minute. */
    minute?: 'numeric' | '2-digit';
    /** The format for displaying the second. */
    second?: 'numeric' | '2-digit';
    /** The format for displaying the time zone name. */
    timeZoneName?: 'short' | 'long';
    /** The time zone to express the time in. */
    timeZone?: string;
    /** The format for displaying the hour. */
    hourFormat?: 'auto' | '12' | '24';
    class?: string;
  }

  let {
    date = new Date(),
    locale,
    weekday,
    era,
    year,
    month,
    day,
    hour,
    minute,
    second,
    timeZoneName,
    timeZone,
    hourFormat = 'auto',
    class: className = '',
    ...restProps
  }: Props = $props();

  let parsedDate = $derived.by(() => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return isNaN(d.getTime()) ? null : d;
  });

  let hour12 = $derived(
    hourFormat === 'auto' ? undefined : hourFormat === '12'
  );

  let formatted = $derived.by(() => {
    if (!parsedDate) return '';
    try {
      const options: Intl.DateTimeFormatOptions = {
        ...(weekday ? { weekday } : {}),
        ...(era ? { era } : {}),
        ...(year ? { year } : {}),
        ...(month ? { month } : {}),
        ...(day ? { day } : {}),
        ...(hour ? { hour } : {}),
        ...(minute ? { minute } : {}),
        ...(second ? { second } : {}),
        ...(timeZoneName ? { timeZoneName } : {}),
        ...(timeZone ? { timeZone } : {}),
        ...(hour12 !== undefined ? { hour12 } : {})
      };
      return new Intl.DateTimeFormat(locale || undefined, options).format(parsedDate);
    } catch {
      return parsedDate.toLocaleString();
    }
  });

  let isoString = $derived(parsedDate ? parsedDate.toISOString() : undefined);
</script>

{#if parsedDate}
  <time datetime={isoString} class="wa-format-date {className}" {...restProps}>{formatted}</time>
{/if}
