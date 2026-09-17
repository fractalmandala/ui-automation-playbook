<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    trigger?: Snippet;
    content?: Snippet;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    open = $bindable(false),
    placement = 'bottom',
    trigger,
    content,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  function toggle() {
    open = !open;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      open = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  data-slot="popup-root"
  data-placement={placement}
  data-state={open ? 'open' : 'closed'}
  class="cui-popup-container {className}"
  {...restProps}
>
  <div
    class="cui-popup-anchor"
    data-slot="anchor"
    onclick={toggle}
    role="button"
    tabindex="0"
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
  >
    {#if trigger}
      {@render trigger()}
    {:else if children}
      {@render children()}
    {:else}
      <button type="button" class="cui-button" data-variant="secondary" data-size="sm">Toggle Popup</button>
    {/if}
  </div>

  {#if open}
    <div class="cui-popup-floating" data-slot="popup" role="tooltip">
      {#if content}
        {@render content()}
      {:else}
        <div class="cui-popup-default-content">Popup Content</div>
      {/if}
      <div class="cui-popup-arrow" data-slot="arrow"></div>
    </div>
  {/if}
</div>
