<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    value?: string;
    name?: string;
    label?: string;
    hint?: string;
    orientation?: 'vertical' | 'horizontal';
    children?: Snippet;
    onchange?: (value: string) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    value = $bindable(''),
    name = 'radio-group',
    label = '',
    hint = '',
    orientation = 'vertical',
    children,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<fieldset
  class="cui-radio-group-root {className}"
  data-slot="radiogroup-root"
  data-orientation={orientation}
  {...restProps}
>
  {#if label}
    <legend class="cui-radio-group-label" data-slot="label">{label}</legend>
  {/if}

  <div class="cui-radio-group-items" data-slot="items">
    {#if children}
      {@render children()}
    {/if}
  </div>

  {#if hint}
    <span class="cui-radio-group-hint" data-slot="hint">{hint}</span>
  {/if}
</fieldset>
