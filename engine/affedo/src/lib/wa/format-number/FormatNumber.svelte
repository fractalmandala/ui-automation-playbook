<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import './format-number.css';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    /** The number to format. Defaults to 0. */
    value?: number;
    /** The formatting style to use. Defaults to 'decimal'. */
    type?: 'currency' | 'decimal' | 'percent';
    /** The locale to format with. */
    locale?: string;
    /** Turns off grouping separators. */
    withoutGrouping?: boolean;
    /** The ISO 4217 currency code to use when formatting. Defaults to 'USD'. */
    currency?: string;
    /** How to display the currency. Defaults to 'symbol'. */
    currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
    /** The minimum number of integer digits to use (1-21). */
    minimumIntegerDigits?: number;
    /** The minimum number of fraction digits to use (0-100). */
    minimumFractionDigits?: number;
    /** The maximum number of fraction digits to use (0-100). */
    maximumFractionDigits?: number;
    /** The minimum number of significant digits to use (1-21). */
    minimumSignificantDigits?: number;
    /** The maximum number of significant digits to use (1-21). */
    maximumSignificantDigits?: number;
    class?: string;
  }

  let {
    value = 0,
    type = 'decimal',
    locale,
    withoutGrouping = false,
    currency = 'USD',
    currencyDisplay = 'symbol',
    minimumIntegerDigits,
    minimumFractionDigits,
    maximumFractionDigits,
    minimumSignificantDigits,
    maximumSignificantDigits,
    class: className = '',
    ...restProps
  }: Props = $props();

  let formatted = $derived.by(() => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '';
    }
    try {
      const options: Intl.NumberFormatOptions = {
        style: type,
        currency: type === 'currency' ? currency : undefined,
        currencyDisplay: type === 'currency' ? currencyDisplay : undefined,
        useGrouping: !withoutGrouping,
        ...(minimumIntegerDigits !== undefined ? { minimumIntegerDigits } : {}),
        ...(minimumFractionDigits !== undefined ? { minimumFractionDigits } : {}),
        ...(maximumFractionDigits !== undefined ? { maximumFractionDigits } : {}),
        ...(minimumSignificantDigits !== undefined ? { minimumSignificantDigits } : {}),
        ...(maximumSignificantDigits !== undefined ? { maximumSignificantDigits } : {})
      };
      return new Intl.NumberFormat(locale || undefined, options).format(value);
    } catch {
      return String(value);
    }
  });
</script>

{#if !isNaN(value)}
  <span class="wa-format-number {className}" {...restProps}>{formatted}</span>
{/if}
