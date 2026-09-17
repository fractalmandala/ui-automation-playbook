<script lang="ts">
  interface Props {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    hint?: string;
    disabled?: boolean;
    showValue?: boolean;
    onchange?: (value: number) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    value = $bindable(50),
    min = 0,
    max = 100,
    step = 1,
    size = 'md',
    label = '',
    hint = '',
    disabled = false,
    showValue = true,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  let percentage = $derived(Math.round(((value - min) / (max - min)) * 100));

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = Number(target.value);
    onchange?.(value);
  }
</script>

<div
  class="cui-slider-root {className}"
  data-slot="slider-root"
  data-size={size}
  data-disabled={disabled ? '' : undefined}
  style="--slider-pct: {percentage}%;"
  {...restProps}
>
  {#if label || showValue}
    <div class="cui-slider-header" data-slot="header">
      {#if label}
        <span class="cui-slider-label" data-slot="label">{label}</span>
      {/if}
      {#if showValue}
        <span class="cui-slider-value" data-slot="value">{value}</span>
      {/if}
    </div>
  {/if}

  <div class="cui-slider-track-wrap" data-slot="trackWrap">
    <div class="cui-slider-fill" data-slot="fill"></div>
    <input
      type="range"
      {min}
      {max}
      {step}
      {value}
      {disabled}
      class="cui-slider-input"
      data-slot="input"
      oninput={handleInput}
    />
  </div>

  {#if hint}
    <span class="cui-slider-hint" data-slot="hint">{hint}</span>
  {/if}
</div>
