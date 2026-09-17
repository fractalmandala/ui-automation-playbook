<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    value?: number;
    indeterminate?: boolean;
    label?: string;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    value = 0,
    indeterminate = false,
    label = 'Progress',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const clamped = $derived(Math.max(0, Math.min(value, 100)));
</script>

<div
  class="cui-progress-bar {className}"
  data-slot="progress-root"
  data-indeterminate={indeterminate ? '' : undefined}
  role="progressbar"
  aria-valuenow={indeterminate ? undefined : clamped}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label={label}
  {...restProps}
>
  <div
    class="cui-progress-fill"
    data-slot="fill"
    style="width: {indeterminate ? '100%' : clamped + '%'};"
  >
    {#if !indeterminate && children}
      <span class="cui-progress-label" data-slot="label">
        {@render children()}
      </span>
    {/if}
  </div>
</div>
