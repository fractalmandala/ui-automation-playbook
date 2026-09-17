<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import Popup from '../popup/Popup.svelte';
  import {
    formatDayPeriod,
    resolveHour12,
    timeSegmentsToWire,
    wireToTimeSegments,
    type TimeSegments,
    type WireOptions
  } from './time-segments.js';
  import '../_shared/wa-styles/component/form-control.css';
  import './time-input.css';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** The committed wire value as HH:mm or HH:mm:ss (always 24-hour wire format). */
    value?: string;
    /** The default value used for form reset. */
    defaultValue?: string;
    /** The name submitted with form data. */
    name?: string;
    /** Disables the time input. */
    disabled?: boolean;
    /** Makes the time input required for form submission. */
    required?: boolean;
    /** Makes the field non-editable. */
    readonly?: boolean;
    /** The time input's size. */
    size?: 'xs' | 's' | 'm' | 'l' | 'xl';
    /** Visual appearance. */
    appearance?: 'filled' | 'outlined' | 'filled-outlined';
    /** Draws pill-style input with rounded edges. */
    pill?: boolean;
    /** Adds a clear button when the input is populated. */
    clearable?: boolean;
    /** The time input's label. */
    label?: string;
    /** The time input's hint. */
    hint?: string;
    /** The hour format ('auto', '12', or '24'). */
    hourFormat?: 'auto' | '12' | '24';
    /** Includes seconds segment and column. */
    withSeconds?: boolean;
    /** Shows the 'Now' button in the popup footer. */
    withNow?: boolean;
    /** Whether the popup column picker is open. */
    open?: boolean;
    /** Earliest selectable time. */
    min?: string;
    /** Latest selectable time. */
    max?: string;
    /** Locale override. */
    locale?: string;
    /** Custom label snippet. */
    labelSnippet?: Snippet;
    /** Custom hint snippet. */
    hintSnippet?: Snippet;
    /** Start decoration slot. */
    startSnippet?: Snippet;
    /** End decoration slot. */
    endSnippet?: Snippet;
    /** Custom footer snippet for popup. */
    footerSnippet?: Snippet;
    onchange?: (event: Event) => void;
    oninput?: (event: Event) => void;
    onclear?: () => void;
    class?: string;
  }

  let {
    value = $bindable(''),
    defaultValue = '',
    name = '',
    disabled = false,
    required = false,
    readonly = false,
    size = 'm',
    appearance = 'outlined',
    pill = false,
    clearable = false,
    label = '',
    hint = '',
    hourFormat = 'auto',
    withSeconds = false,
    withNow = true,
    open = $bindable(false),
    min = '',
    max = '',
    locale = '',
    labelSnippet,
    hintSnippet,
    startSnippet,
    endSnippet,
    footerSnippet,
    onchange,
    oninput,
    onclear,
    class: className = '',
    ...restProps
  }: Props = $props();

  const uid = Math.random().toString(36).slice(2, 9);
  const hintId = `wa-time-hint-${uid}`;

  let is12Hour = $derived(
    hourFormat === '12' ? true : hourFormat === '24' ? false : resolveHour12(locale)
  );

  let wireOpts = $derived<WireOptions>({
    hour12: is12Hour,
    withSeconds
  });

  let segments = $state<TimeSegments>({ hour: null, minute: null, second: null, dayPeriod: null });
  let initialized = $state(false);

  $effect(() => {
    if (!initialized) {
      const v = value || defaultValue;
      segments = wireToTimeSegments(v, wireOpts);
      initialized = true;
      return;
    }
    const currentWire = timeSegmentsToWire(segments, wireOpts);
    if (value !== currentWire) {
      segments = wireToTimeSegments(value, wireOpts);
    }
  });

  function updateFromSegments() {
    const newWire = timeSegmentsToWire(segments, wireOpts);
    if (newWire !== value) {
      value = newWire;
      oninput?.(new Event('input', { bubbles: true }));
      onchange?.(new Event('change', { bubbles: true }));
    }
  }

  function handleHourChange(h: number) {
    segments = { ...segments, hour: h };
    if (is12Hour && segments.dayPeriod == null) {
      segments.dayPeriod = 0; // default AM
    }
    if (segments.minute == null) {
      segments.minute = 0;
    }
    updateFromSegments();
  }

  function handleMinuteChange(m: number) {
    segments = { ...segments, minute: m };
    if (segments.hour == null) {
      segments.hour = is12Hour ? 12 : 0;
    }
    if (is12Hour && segments.dayPeriod == null) {
      segments.dayPeriod = 0;
    }
    updateFromSegments();
  }

  function handleSecondChange(s: number) {
    segments = { ...segments, second: s };
    updateFromSegments();
  }

  function handleDayPeriodChange(dp: 0 | 1) {
    segments = { ...segments, dayPeriod: dp };
    if (segments.hour == null) segments.hour = 12;
    if (segments.minute == null) segments.minute = 0;
    updateFromSegments();
  }

  function handleNow() {
    const now = new Date();
    const h24 = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    if (is12Hour) {
      segments = {
        hour: h24 % 12 || 12,
        minute: m,
        second: withSeconds ? s : null,
        dayPeriod: h24 < 12 ? 0 : 1
      };
    } else {
      segments = {
        hour: h24,
        minute: m,
        second: withSeconds ? s : null,
        dayPeriod: null
      };
    }
    updateFromSegments();
  }

  function handleClear(e: MouseEvent) {
    e.stopPropagation();
    segments = { hour: null, minute: null, second: null, dayPeriod: null };
    value = '';
    onclear?.();
    oninput?.(new Event('input', { bubbles: true }));
    onchange?.(new Event('change', { bubbles: true }));
  }

  let hoursList = $derived.by(() => {
    if (is12Hour) {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
    return Array.from({ length: 24 }, (_, i) => i);
  });

  let minutesList = Array.from({ length: 60 }, (_, i) => i);
  let secondsList = Array.from({ length: 60 }, (_, i) => i);
</script>

<div
  class="wa-time-input {className}"
  data-appearance={appearance}
  data-size={size}
  data-pill={pill ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  data-readonly={readonly ? '' : undefined}
  {...restProps}
>
  <div class="form-control" class:form-control-has-label={!!label || !!labelSnippet} part="form-control">
    {#if label || labelSnippet}
      <label class="form-control-label" part="form-control-label label">
        {#if labelSnippet}
          {@render labelSnippet()}
        {:else}
          {label}
        {/if}
      </label>
    {/if}

    <div class="time-input-popup">
      <Popup active={open} placement="bottom-start" distance={4} flip shift>
        {#snippet anchorSnippet()}
          <div class="input-wrapper" part="input-wrapper form-control-input">
            {#if startSnippet}
              <span class="start" part="start">
                {@render startSnippet()}
              </span>
            {/if}

            <div class="segments" part="input">
              <input
                type="text"
                class="segment-input segment-hour"
                inputmode="numeric"
                maxlength={2}
                placeholder="--"
                value={segments.hour != null ? String(segments.hour).padStart(2, '0') : ''}
                {disabled}
                {readonly}
                oninput={(e) => {
                  const val = Number((e.currentTarget as HTMLInputElement).value.replace(/\D/g, ''));
                  if (!isNaN(val)) handleHourChange(val);
                }}
              />
              <span class="segment-literal">:</span>
              <input
                type="text"
                class="segment-input segment-minute"
                inputmode="numeric"
                maxlength={2}
                placeholder="--"
                value={segments.minute != null ? String(segments.minute).padStart(2, '0') : ''}
                {disabled}
                {readonly}
                oninput={(e) => {
                  const val = Number((e.currentTarget as HTMLInputElement).value.replace(/\D/g, ''));
                  if (!isNaN(val)) handleMinuteChange(val);
                }}
              />
              {#if withSeconds}
                <span class="segment-literal">:</span>
                <input
                  type="text"
                  class="segment-input segment-second"
                  inputmode="numeric"
                  maxlength={2}
                  placeholder="--"
                  value={segments.second != null ? String(segments.second).padStart(2, '0') : ''}
                  {disabled}
                  {readonly}
                  oninput={(e) => {
                    const val = Number((e.currentTarget as HTMLInputElement).value.replace(/\D/g, ''));
                    if (!isNaN(val)) handleSecondChange(val);
                  }}
                />
              {/if}
              {#if is12Hour}
                <button
                  type="button"
                  class="segment-input segment-period"
                  {disabled}
                  onclick={() => handleDayPeriodChange(segments.dayPeriod === 1 ? 0 : 1)}
                >
                  {segments.dayPeriod != null ? formatDayPeriod(locale, segments.dayPeriod) : '--'}
                </button>
              {/if}
            </div>

            {#if clearable && !!value && !disabled && !readonly}
              <button
                type="button"
                class="clear-button"
                part="clear-button"
                aria-label="Clear time"
                onclick={handleClear}
              >
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </button>
            {/if}

            <button
              type="button"
              class="expand-button"
              part="expand-button"
              aria-label="Toggle time picker popup"
              {disabled}
              onclick={() => (open = !open)}
            >
              <svg width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </button>

            {#if endSnippet}
              <span class="end" part="end">
                {@render endSnippet()}
              </span>
            {/if}
          </div>
        {/snippet}

        <!-- Popup Body Column Pickers -->
        <div class="popup-body" part="popup-body">
          <div class="columns" part="columns">
            <!-- Hours Column -->
            <div class="column" part="column" role="listbox" aria-label="Hours" tabindex="-1">
              {#each hoursList as h}
                <button
                  type="button"
                  class="column-item"
                  class:selected={segments.hour === h}
                  role="option"
                  aria-selected={segments.hour === h}
                  part="column-item {segments.hour === h ? 'column-item-selected' : ''}"
                  onclick={() => handleHourChange(h)}
                >
                  {String(h).padStart(2, '0')}
                </button>
              {/each}
            </div>

            <!-- Minutes Column -->
            <div class="column" part="column" role="listbox" aria-label="Minutes" tabindex="-1">
              {#each minutesList as m}
                <button
                  type="button"
                  class="column-item"
                  class:selected={segments.minute === m}
                  role="option"
                  aria-selected={segments.minute === m}
                  part="column-item {segments.minute === m ? 'column-item-selected' : ''}"
                  onclick={() => handleMinuteChange(m)}
                >
                  {String(m).padStart(2, '0')}
                </button>
              {/each}
            </div>

            <!-- Seconds Column -->
            {#if withSeconds}
              <div class="column" part="column" role="listbox" aria-label="Seconds" tabindex="-1">
                {#each secondsList as s}
                  <button
                    type="button"
                    class="column-item"
                    class:selected={segments.second === s}
                    role="option"
                    aria-selected={segments.second === s}
                    part="column-item {segments.second === s ? 'column-item-selected' : ''}"
                    onclick={() => handleSecondChange(s)}
                  >
                    {String(s).padStart(2, '0')}
                  </button>
                {/each}
              </div>
            {/if}

            <!-- Day Period Column -->
            {#if is12Hour}
              <div class="column" part="column" role="listbox" aria-label="Period" tabindex="-1">
                <button
                  type="button"
                  class="column-item"
                  class:selected={segments.dayPeriod === 0}
                  role="option"
                  aria-selected={segments.dayPeriod === 0}
                  part="column-item {segments.dayPeriod === 0 ? 'column-item-selected' : ''}"
                  onclick={() => handleDayPeriodChange(0)}
                >
                  {formatDayPeriod(locale, 0)}
                </button>
                <button
                  type="button"
                  class="column-item"
                  class:selected={segments.dayPeriod === 1}
                  role="option"
                  aria-selected={segments.dayPeriod === 1}
                  part="column-item {segments.dayPeriod === 1 ? 'column-item-selected' : ''}"
                  onclick={() => handleDayPeriodChange(1)}
                >
                  {formatDayPeriod(locale, 1)}
                </button>
              </div>
            {/if}
          </div>

          <!-- Footer / Now button -->
          {#if footerSnippet}
            <div class="popup-footer" part="popup-footer">
              {@render footerSnippet()}
            </div>
          {:else if withNow}
            <div class="popup-footer" part="popup-footer">
              <button type="button" class="now-button" part="now-button" onclick={handleNow}>
                Now
              </button>
            </div>
          {/if}
        </div>
      </Popup>
    </div>

    {#if hint || hintSnippet}
      <div id={hintId} class="hint has-slotted" part="hint">
        {#if hintSnippet}
          {@render hintSnippet()}
        {:else}
          {hint}
        {/if}
      </div>
    {/if}

    <!-- Hidden native input for form participation -->
    <input
      type="time"
      class="value-input"
      tabindex="-1"
      aria-hidden="true"
      {name}
      {value}
      {min}
      {max}
      {disabled}
      {required}
    />
  </div>
</div>
