<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    value?: string;
    checked?: boolean;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    name?: string;
    label?: string;
    hint?: string;
    children?: Snippet;
    onchange?: (value: string) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    value = '',
    checked = false,
    size = 'md',
    disabled = false,
    name,
    label = '',
    hint = '',
    children,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  function select() {
    if (disabled) return;
    onchange?.(value);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      select();
    }
  }
</script>

<label
  class="cui-radio-root {className}"
  data-slot="radio-root"
  data-size={size}
  data-checked={checked ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  {...restProps}
>
  <span
    class="cui-radio-control"
    data-slot="control"
    role="radio"
    aria-checked={checked}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    onclick={select}
    onkeydown={handleKeydown}
  >
    <span class="cui-radio-dot" data-slot="indicator"></span>
  </span>

  {#if label || children}
    <div class="cui-radio-content" data-slot="content">
      <span class="cui-radio-label" data-slot="label">
        {#if children}
          {@render children()}
        {:else}
          {label}
        {/if}
      </span>
      {#if hint}
        <span class="cui-radio-hint" data-slot="hint">{hint}</span>
      {/if}
    </div>
  {/if}

  {#if name}
    <input type="radio" {name} {value} {checked} {disabled} style="display: none;" />
  {/if}
</label>
