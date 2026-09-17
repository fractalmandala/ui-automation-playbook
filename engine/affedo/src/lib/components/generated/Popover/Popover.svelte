<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    trigger?: Snippet;
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    open = $bindable(false),
    placement = 'bottom',
    trigger,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  function toggle() {
    open = !open;
  }
</script>

<div
  class="cui-popover-root {className}"
  data-slot="popover-root"
  data-open={open ? '' : undefined}
  {...restProps}
>
  <div class="cui-popover-trigger" onclick={toggle} role="button" tabindex="0" onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}>
    {#if trigger}
      {@render trigger()}
    {:else}
      <button type="button" class="cui-button">Toggle Popover</button>
    {/if}
  </div>

  {#if open}
    <div
      class="cui-popover-panel"
      data-slot="panel"
      data-placement={placement}
      role="dialog"
    >
      {@render children()}
    </div>
  {/if}
</div>
