<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  interface Props {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    label?: string;
    children: Snippet;
    class?: string;
    onchange?: (val: string) => void;
    [key: string]: any;
  }

  let {
    value = $bindable(''),
    placeholder = 'Select an option...',
    disabled = false,
    label,
    children,
    class: className = '',
    onchange,
    ...restProps
  }: Props = $props();

  let isOpen = $state(false);
  let selectedDisplay = $state('');

  function selectOption(val: string, displayLabel: string) {
    value = val;
    selectedDisplay = displayLabel;
    isOpen = false;
    onchange?.(val);
  }

  setContext('cui-select-ctx', {
    getSelected: () => value,
    select: selectOption
  });
</script>

<div
  class="cui-select-root {className}"
  data-slot="select-root"
  data-open={isOpen ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  {...restProps}
>
  {#if label}
    <span class="cui-select-label" data-slot="label">{label}</span>
  {/if}

  <button
    type="button"
    class="cui-select-trigger"
    data-slot="trigger"
    aria-expanded={isOpen}
    {disabled}
    onclick={() => { if (!disabled) isOpen = !isOpen; }}
  >
    <span class="cui-select-value" class:placeholder={!value}>
      {selectedDisplay || value || placeholder}
    </span>
    <span class="cui-select-chevron" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  </button>

  {#if isOpen}
    <div class="cui-select-menu" data-slot="menu" role="listbox">
      {@render children()}
    </div>
  {/if}
</div>
