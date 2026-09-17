<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
  import { localeFieldOrder, type SegmentField } from './field-order.js';
  import { isoToParts, partsToIso, type DateParts } from './parts.js';
  import '../_shared/wa-styles/component/form-control.css';
  import './known-date.css';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** The committed value as an ISO YYYY-MM-DD string. */
    value?: string;
    /** The default value used for form reset. */
    defaultValue?: string;
    /** The name submitted with form data. */
    name?: string;
    /** Disables the known date. */
    disabled?: boolean;
    /** Makes the known date required for form submission. */
    required?: boolean;
    /** Makes the fields non-editable. */
    readonly?: boolean;
    /** The known date's size. */
    size?: 'xs' | 's' | 'm' | 'l' | 'xl';
    /** The known date's visual appearance. */
    appearance?: 'filled' | 'outlined' | 'filled-outlined';
    /** Draws pill-style fields with rounded edges. */
    pill?: boolean;
    /** The known date's label. */
    label?: string;
    /** The known date's hint. */
    hint?: string;
    /** Browser autofill family ('bday', 'off', 'on', etc.). */
    autocomplete?: string;
    /** Earliest selectable date as YYYY-MM-DD. */
    min?: string;
    /** Latest selectable date as YYYY-MM-DD. */
    max?: string;
    /** BCP-47 locale override. */
    locale?: string;
    /** Custom label snippet. */
    labelSnippet?: Snippet;
    /** Custom hint snippet. */
    hintSnippet?: Snippet;
    onchange?: (event: Event) => void;
    oninput?: (event: Event) => void;
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
    label = '',
    hint = '',
    autocomplete = '',
    min = '',
    max = '',
    locale = '',
    labelSnippet,
    hintSnippet,
    onchange,
    oninput,
    class: className = '',
    ...restProps
  }: Props = $props();

  const uid = Math.random().toString(36).slice(2, 9);
  const groupId = `wa-known-date-${uid}`;
  const hintId = `${groupId}-hint`;

  let parts = $state<DateParts>({ day: '', month: '', year: '' });
  let lastEmittedValue = $state('');
  let initialized = $state(false);

  $effect(() => {
    if (!initialized) {
      const v = value || defaultValue;
      parts = isoToParts(v);
      lastEmittedValue = v;
      initialized = true;
      return;
    }
    const currentIso = partsToIso(parts);
    if (value !== currentIso) {
      parts = isoToParts(value);
      lastEmittedValue = value;
    }
  });

  let fieldOrder = $derived(localeFieldOrder(locale));

  function autocompleteFor(field: SegmentField): HTMLInputAttributes['autocomplete'] {
    const family = autocomplete.trim();
    if (!family) return undefined;
    if (family === 'bday') {
      if (field === 'day') return 'bday-day';
      if (field === 'month') return 'bday-month';
      return 'bday-year';
    }
    if (family === 'off' || family === 'on') return family;
    return field === 'year' ? (family as HTMLInputAttributes['autocomplete']) : undefined;
  }

  function handleFieldInput(event: Event, field: SegmentField) {
    if (readonly) return;
    const target = event.currentTarget as HTMLInputElement;
    const maxLen = field === 'year' ? 4 : 2;
    const sanitized = target.value.replace(/\D/g, '').slice(0, maxLen);
    if (sanitized !== target.value) target.value = sanitized;

    parts = { ...parts, [field]: sanitized };
    const newIso = partsToIso(parts);

    if (newIso !== value) {
      value = newIso;
    }

    oninput?.(event);

    if (newIso !== lastEmittedValue) {
      lastEmittedValue = newIso;
      onchange?.(new Event('change', { bubbles: true }));
    }
  }

  const fieldLabels: Record<SegmentField, string> = {
    day: 'Day',
    month: 'Month',
    year: 'Year'
  };
</script>

<div
  class="wa-known-date {className}"
  data-appearance={appearance}
  data-size={size}
  data-pill={pill ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  data-readonly={readonly ? '' : undefined}
  {...restProps}
>
  <div class="form-control" class:form-control-has-label={!!label || !!labelSnippet} part="form-control">
    {#if label || labelSnippet}
      <fieldset class="fieldset" part="fieldset">
        <legend part="legend">
          <span class="label form-control-label" part="form-control-label label">
            {#if labelSnippet}
              {@render labelSnippet()}
            {:else}
              {label}
            {/if}
          </span>
        </legend>
        <div class="fields" part="base known-date form-control-input fields">
          {#each fieldOrder as field (field)}
            {@const fieldId = `${groupId}-${field}`}
            <div class="field field-{field}" part="field field-{field}">
              <input
                id={fieldId}
                class="field-input"
                part="field-input"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength={field === 'year' ? 4 : 2}
                data-field={field}
                autocomplete={autocompleteFor(field)}
                aria-describedby={hint || hintSnippet ? hintId : undefined}
                aria-required={required ? 'true' : 'false'}
                value={parts[field]}
                {disabled}
                {readonly}
                oninput={(e) => handleFieldInput(e, field)}
              />
              <label class="field-label" part="field-label" for={fieldId}>{fieldLabels[field]}</label>
            </div>
          {/each}
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
      </fieldset>
    {:else}
      <div class="fieldset" part="fieldset" role="group" aria-label="Date">
        <div class="fields" part="base known-date form-control-input fields">
          {#each fieldOrder as field (field)}
            {@const fieldId = `${groupId}-${field}`}
            <div class="field field-{field}" part="field field-{field}">
              <input
                id={fieldId}
                class="field-input"
                part="field-input"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength={field === 'year' ? 4 : 2}
                data-field={field}
                autocomplete={autocompleteFor(field)}
                aria-describedby={hint || hintSnippet ? hintId : undefined}
                aria-required={required ? 'true' : 'false'}
                value={parts[field]}
                {disabled}
                {readonly}
                oninput={(e) => handleFieldInput(e, field)}
              />
              <label class="field-label" part="field-label" for={fieldId}>{fieldLabels[field]}</label>
            </div>
          {/each}
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
      </div>
    {/if}

    <!-- Hidden native date input for form data mirroring -->
    <input
      type="date"
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
