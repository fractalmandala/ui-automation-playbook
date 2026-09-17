<script lang="ts">
  interface Props {
    value: string;
    label?: string;
    copiedLabel?: string;
    class?: string;
    [key: string]: any;
  }

  let {
    value,
    label = 'Copy',
    copiedLabel = 'Copied!',
    class: className = '',
    ...restProps
  }: Props = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function handleCopy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      copied = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (e) {
      console.error('Failed to copy text: ', e);
    }
  }
</script>

<button
  type="button"
  class="cui-copy-btn {className}"
  data-slot="copy-root"
  data-copied={copied ? '' : undefined}
  onclick={handleCopy}
  aria-label={copied ? copiedLabel : label}
  {...restProps}
>
  {#if copied}
    <span class="cui-copy-icon" data-slot="check-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
    <span class="cui-copy-label">{copiedLabel}</span>
  {:else}
    <span class="cui-copy-icon" data-slot="copy-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </span>
    <span class="cui-copy-label">{label}</span>
  {/if}
</button>
