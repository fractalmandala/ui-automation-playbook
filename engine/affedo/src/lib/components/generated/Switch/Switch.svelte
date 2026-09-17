<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    checked?: boolean;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    required?: boolean;
    name?: string;
    label?: string;
    hint?: string;
    children?: Snippet;
    onchange?: (checked: boolean) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    checked = $bindable(false),
    size = 'md',
    disabled = false,
    required = false,
    name,
    label = '',
    hint = '',
    children,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  function toggle() {
    if (disabled) return;
    checked = !checked;
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
  class="cui-switch-root {className}"
  data-slot="switch-root"
  data-size={size}
  data-checked={checked ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  {...restProps}
>
  <span
    class="cui-switch-track"
    data-slot="track"
    role="switch"
    aria-checked={checked}
    aria-required={required}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    onclick={toggle}
    onkeydown={handleKeydown}
  >
    <span class="cui-switch-thumb" data-slot="thumb"></span>
  </span>

  {#if label || children}
    <div class="cui-switch-content" data-slot="content">
      <span class="cui-switch-label" data-slot="label">
        {#if children}
          {@render children()}
        {:else}
          {label}
        {/if}
      </span>
      {#if hint}
        <span class="cui-switch-hint" data-slot="hint">{hint}</span>
      {/if}
    </div>
  {/if}

  {#if name}
    <input type="checkbox" {name} {checked} {disabled} {required} style="display: none;" />
  {/if}
</label>
