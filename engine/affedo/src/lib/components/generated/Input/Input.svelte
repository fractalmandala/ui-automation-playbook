<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    value?: string;
    label?: string;
    hint?: string;
    error?: string;
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    appearance?: 'outlined' | 'filled';
    type?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    clearable?: boolean;
    start?: Snippet;
    end?: Snippet;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    id = 'cui-input-' + Math.random().toString(36).slice(2, 8),
    value = $bindable(''),
    label = '',
    hint = '',
    error = '',
    placeholder = '',
    size = 'md',
    appearance = 'outlined',
    type = 'text',
    disabled = false,
    readonly = false,
    required = false,
    clearable = false,
    start,
    end,
    oninput,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  function handleClear() {
    value = '';
  }
</script>

<div
  class="cui-input-root {className}"
  data-slot="input-root"
  data-size={size}
  data-appearance={appearance}
  data-invalid={error ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
>
  {#if label}
    <label for={id} class="cui-input-label" data-slot="label">
      {label}
      {#if required}<span class="cui-input-required">*</span>{/if}
    </label>
  {/if}

  <div class="cui-input-wrapper" data-slot="wrapper">
    {#if start}
      <span class="cui-input-start" data-slot="start">
        {@render start()}
      </span>
    {/if}

    <input
      {id}
      {type}
      {placeholder}
      {disabled}
      {readonly}
      {required}
      bind:value
      class="cui-input-control"
      data-slot="control"
      {oninput}
      {onchange}
      {...restProps}
    />

    {#if clearable && value && !disabled && !readonly}
      <button
        type="button"
        class="cui-input-clear"
        data-slot="clearButton"
        onclick={handleClear}
        aria-label="Clear input"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    {/if}

    {#if end}
      <span class="cui-input-end" data-slot="end">
        {@render end()}
      </span>
    {/if}
  </div>

  {#if error}
    <span class="cui-input-error" data-slot="error">{error}</span>
  {:else if hint}
    <span class="cui-input-hint" data-slot="hint">{hint}</span>
  {/if}
</div>
