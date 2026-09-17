<script lang="ts">
  interface Props {
    value?: string;
    label?: string;
    hint?: string;
    error?: string;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    maxlength?: number;
    oninput?: (e: Event) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    id = 'cui-textarea-' + Math.random().toString(36).slice(2, 8),
    value = $bindable(''),
    label = '',
    hint = '',
    error = '',
    placeholder = '',
    rows = 3,
    disabled = false,
    readonly = false,
    required = false,
    maxlength,
    oninput,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<div
  class="cui-textarea-root {className}"
  data-slot="textarea-root"
  data-invalid={error ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
>
  {#if label}
    <label for={id} class="cui-textarea-label" data-slot="label">
      {label}
      {#if required}<span class="cui-textarea-required">*</span>{/if}
    </label>
  {/if}

  <textarea
    {id}
    {placeholder}
    {rows}
    {disabled}
    {readonly}
    {required}
    {maxlength}
    bind:value
    class="cui-textarea-control"
    data-slot="control"
    {oninput}
    {...restProps}
  ></textarea>

  <div class="cui-textarea-meta">
    {#if error}
      <span class="cui-textarea-error" data-slot="error">{error}</span>
    {:else if hint}
      <span class="cui-textarea-hint" data-slot="hint">{hint}</span>
    {/if}
    {#if maxlength}
      <span class="cui-textarea-count">{value.length} / {maxlength}</span>
    {/if}
  </div>
</div>
