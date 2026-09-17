<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    size?: 'sm' | 'md' | 'lg';
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
    size = 'md',
    title = 'Dialog Title',
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
    class="cui-dialog-root"
    data-slot="dialog-root"
    data-size={size}
    data-state={open ? 'open' : 'closed'}
    {...restProps}
  >
    <div
      class="cui-dialog-overlay"
      data-slot="overlay"
      onclick={close}
      role="presentation"
    ></div>

    <div class="cui-dialog-panel {className}" data-slot="panel" role="dialog" aria-modal="true">
      <header class="cui-dialog-header" data-slot="header">
        {#if header}
          {@render header()}
        {:else}
          <h2 class="cui-dialog-title" data-slot="title">{title}</h2>
        {/if}
        <button
          type="button"
          class="cui-dialog-close"
          data-slot="closeButton"
          onclick={close}
          aria-label="Close dialog"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </header>

      <div class="cui-dialog-body" data-slot="body">
        {#if children}
          {@render children()}
        {:else}
          <p class="cui-dialog-placeholder">This is the dialog body content.</p>
        {/if}
      </div>

      {#if footer}
        <footer class="cui-dialog-footer" data-slot="footer">
          {@render footer()}
        </footer>
      {/if}
    </div>
  </div>
{/if}
