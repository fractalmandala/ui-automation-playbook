<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  interface Props {
    value: string;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    value,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const ctx = getContext<any>('cui-tab-ctx');
  const isActive = $derived(ctx ? ctx.getActive() === value : true);
</script>

{#if isActive}
  <div
    role="tabpanel"
    class="cui-tab-panel {className}"
    data-slot="tab-panel"
    {...restProps}
  >
    {@render children?.()}
  </div>
{/if}
