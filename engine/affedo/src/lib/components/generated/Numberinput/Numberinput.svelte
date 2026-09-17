<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    id?: string;
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    hint?: string;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    start?: Snippet;
    end?: Snippet;
    onchange?: (value: number) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    id = 'cui-numberinput-' + Math.random().toString(36).slice(2, 8),
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    size = 'md',
    label = '',
    hint = '',
    error = '',
    placeholder = '',
    disabled = false,
    readonly = false,
    required = false,
    start,
    end,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  function clamp(n: number): number {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    return Math.min(hi, Math.max(lo, n));
  }

  function stepBy(direction: number) {
    if (disabled || readonly) return;
    const base = Number.isFinite(value) ? value : clamp(min);
    const next = clamp(base + direction * step);
    value = next;
    onchange?.(next);
  }

  function handleInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    if (raw === '') return;
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      value = parsed;
      onchange?.(parsed);
    }
  }

  function handleBlur() {
    if (!Number.isFinite(value)) {
      const next = clamp(min);
      value = next;
      onchange?.(next);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepBy(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepBy(-1);
    }
  }
</script>

<div
  class="cui-numberinput-root {className}"
  data-slot="numberinput-root"
  data-size={size}
  data-invalid={error ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
>
  {#if label}
    <label for={id} class="cui-numberinput-label" data-slot="label">
      {label}
      {#if required}<span class="cui-numberinput-required" data-slot="required">*</span>{/if}
    </label>
  {/if}

  <div class="cui-numberinput-wrapper" data-slot="wrapper" role="group">
    {#if start}
      <span class="cui-numberinput-affix" data-slot="start">
        {@render start()}
      </span>
    {/if}

    <button
      type="button"
      class="cui-numberinput-stepper"
      data-slot="stepperDecrement"
      data-dir="down"
      aria-label="Decrease value"
      disabled={disabled || readonly}
      onclick={() => stepBy(-1)}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>

    <input
      {id}
      type="number"
      inputmode="numeric"
      {placeholder}
      {min}
      {max}
      {step}
      {disabled}
      {readonly}
      {required}
      bind:value
      aria-invalid={error ? 'true' : undefined}
      class="cui-numberinput-control"
      data-slot="control"
      oninput={handleInput}
      onblur={handleBlur}
      onkeydown={handleKeydown}
      {...restProps}
    />

    <button
      type="button"
      class="cui-numberinput-stepper"
      data-slot="stepperIncrement"
      data-dir="up"
      aria-label="Increase value"
      disabled={disabled || readonly}
      onclick={() => stepBy(1)}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>

    {#if end}
      <span class="cui-numberinput-affix" data-slot="end">
        {@render end()}
      </span>
    {/if}
  </div>

  {#if error}
    <span class="cui-numberinput-error" data-slot="error">{error}</span>
  {:else if hint}
    <span class="cui-numberinput-hint" data-slot="hint">{hint}</span>
  {/if}
</div>
