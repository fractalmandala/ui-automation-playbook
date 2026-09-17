<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    placement?: 'left' | 'right' | 'top' | 'bottom';
    title?: string;
    children?: Snippet;
    header?: Snippet;
    footer?: Snippet;
    onclose?: () => void;
    class?: string;
    [key: string]: any;
  }

  let {
    open = $bindable(false),
    placement = 'right',
    title = 'Drawer',
    children,
    header,
    footer,
    onclose,
    class: className = '',
    ...restProps
  }: Props = $props();

  function close() {
    open = false;
    onclose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="cui-drawer-root"
    data-slot="drawer-root"
    data-placement={placement}
    data-state={open ? 'open' : 'closed'}
    {...restProps}
  >
    <div
      class="cui-drawer-overlay"
      data-slot="overlay"
      onclick={close}
      role="presentation"
    ></div>

    <div class="cui-drawer-panel {className}" data-slot="panel" role="dialog" aria-modal="true">
      <header class="cui-drawer-header" data-slot="header">
        {#if header}
          {@render header()}
        {:else}
          <h3 class="cui-drawer-title" data-slot="title">{title}</h3>
        {/if}
        <button
          type="button"
          class="cui-drawer-close"
          data-slot="closeButton"
          onclick={close}
          aria-label="Close drawer"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </header>

      <div class="cui-drawer-body" data-slot="body">
        {#if children}
          {@render children()}
        {:else}
          <p class="cui-drawer-placeholder">Drawer Content</p>
        {/if}
      </div>

      {#if footer}
        <footer class="cui-drawer-footer" data-slot="footer">
          {@render footer()}
        </footer>
      {/if}
    </div>
  </div>
{/if}
