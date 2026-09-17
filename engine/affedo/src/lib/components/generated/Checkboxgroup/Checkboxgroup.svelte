<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label?: string;
    hint?: string;
    orientation?: 'vertical' | 'horizontal';
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    label = '',
    hint = '',
    orientation = 'vertical',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<fieldset
  class="cui-checkbox-group-root {className}"
  data-slot="checkboxgroup-root"
  data-orientation={orientation}
  {...restProps}
>
  {#if label}
    <legend class="cui-checkbox-group-label" data-slot="label">{label}</legend>
  {/if}

  <div class="cui-checkbox-group-items" data-slot="items">
    {#if children}
      {@render children()}
    {/if}
  </div>

  {#if hint}
    <span class="cui-checkbox-group-hint" data-slot="hint">{hint}</span>
  {/if}
</fieldset>
