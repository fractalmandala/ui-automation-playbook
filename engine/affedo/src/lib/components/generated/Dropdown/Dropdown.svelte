<script lang="ts">
  import type { Snippet } from 'svelte';

  export interface DropdownItem {
    id: string;
    label: string;
    disabled?: boolean;
    danger?: boolean;
    divider?: boolean;
  }

  interface Props {
    open?: boolean;
    items?: DropdownItem[];
    trigger?: Snippet;
    children?: Snippet;
    onselect?: (item: DropdownItem) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    open = $bindable(false),
    items = [
      { id: '1', label: 'Account Profile' },
      { id: '2', label: 'Settings' },
      { id: 'div-1', label: '', divider: true },
      { id: '3', label: 'Sign Out', danger: true }
    ],
    trigger,
    children,
    onselect,
    class: className = '',
    ...restProps
  }: Props = $props();

  function toggle() {
    open = !open;
  }

  function handleSelect(item: DropdownItem) {
    if (item.disabled || item.divider) return;
    onselect?.(item);
    open = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      open = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="cui-dropdown-root {className}"
  data-slot="dropdown-root"
  data-state={open ? 'open' : 'closed'}
  {...restProps}
>
  <div
    class="cui-dropdown-trigger"
    data-slot="trigger"
    onclick={toggle}
    role="button"
    tabindex="0"
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
  >
    {#if trigger}
      {@render trigger()}
    {:else}
      <button type="button" class="cui-button" data-variant="secondary" data-size="md">
        <span>Options</span>
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="margin-left: var(--space-1)">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    {/if}
  </div>

  {#if open}
    <div class="cui-dropdown-panel" data-slot="panel" role="menu">
      {#if children}
        {@render children()}
      {:else if items && items.length > 0}
        {#each items as item (item.id)}
          {#if item.divider}
            <div class="cui-dropdown-divider" data-slot="divider" role="separator"></div>
          {:else}
            <button
              type="button"
              class="cui-dropdown-item"
              data-slot="item"
              data-danger={item.danger ? '' : undefined}
              disabled={item.disabled}
              onclick={() => handleSelect(item)}
              role="menuitem"
            >
              <span>{item.label}</span>
            </button>
          {/if}
        {/each}
      {/if}
    </div>
  {/if}
</div>
