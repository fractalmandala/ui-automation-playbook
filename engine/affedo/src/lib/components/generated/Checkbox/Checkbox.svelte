<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    checked?: boolean;
    indeterminate?: boolean;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    required?: boolean;
    name?: string;
    value?: string;
    label?: string;
    hint?: string;
    children?: Snippet;
    onchange?: (checked: boolean) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    checked = $bindable(false),
    indeterminate = $bindable(false),
    size = 'md',
    disabled = false,
    required = false,
    name,
    value,
    label = '',
    hint = '',
    children,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  function toggle() {
    if (disabled) return;
    if (indeterminate) {
      indeterminate = false;
      checked = true;
    } else {
      checked = !checked;
    }
    onchange?.(checked);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  }
</script>

<label
  class="cui-checkbox-root {className}"
  data-slot="checkbox-root"
  data-size={size}
  data-checked={checked ? '' : undefined}
  data-indeterminate={indeterminate ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  {...restProps}
>
  <span
    class="cui-checkbox-control"
    data-slot="control"
    role="checkbox"
    aria-checked={indeterminate ? 'mixed' : checked}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    onclick={toggle}
    onkeydown={handleKeydown}
  >
    {#if indeterminate}
      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="3" fill="none">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    {:else if checked}
      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="3" fill="none">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    {/if}
  </span>

  {#if label || children}
    <div class="cui-checkbox-content" data-slot="content">
      <span class="cui-checkbox-label" data-slot="label">
        {#if children}
          {@render children()}
        {:else}
          {label}
        {/if}
      </span>
      {#if hint}
        <span class="cui-checkbox-hint" data-slot="hint">{hint}</span>
      {/if}
    </div>
  {/if}

  {#if name}
    <input type="checkbox" {name} {value} {checked} {disabled} {required} style="display: none;" />
  {/if}
</label>
