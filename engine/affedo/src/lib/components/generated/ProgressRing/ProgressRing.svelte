<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    value?: number;
    label?: string;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    value = 0,
    label = 'Progress Ring',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const clamped = $derived(Math.max(0, Math.min(value, 100)));
  const circumference = 2 * Math.PI * 18; // r=18
  const offset = $derived(circumference - (circumference * clamped) / 100);
</script>

<div
  class="cui-progress-ring {className}"
  data-slot="progress-ring-root"
  role="progressbar"
  aria-valuenow={clamped}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label={label}
  {...restProps}
>
  <svg class="cui-progress-ring-svg" viewBox="0 0 44 44" width="44" height="44">
    <circle
      class="cui-progress-ring-track"
      cx="22"
      cy="22"
      r="18"
      fill="none"
      stroke-width="4"
    />
    <circle
      class="cui-progress-ring-fill"
      cx="22"
      cy="22"
      r="18"
      fill="none"
      stroke-width="4"
      stroke-dasharray={circumference}
      stroke-dashoffset={offset}
      transform="rotate(-90 22 22)"
    />
  </svg>
  <div class="cui-progress-ring-center">
    {#if children}
      {@render children()}
    {:else}
      {Math.round(clamped)}%
    {/if}
  </div>
</div>
