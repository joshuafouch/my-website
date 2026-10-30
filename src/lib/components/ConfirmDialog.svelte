<script lang="ts">
  let {
    open = $bindable(false),
    title = 'Remove?',
    message = 'Are you sure you want to remove this?',
    confirmLabel = 'Remove',
    cancelLabel = 'Cancel',
    onconfirm
  }: {
    open?: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onconfirm: () => void;
  } = $props();

  let dialog = $state<HTMLDialogElement | null>(null);

  $effect(() => {
    const el = dialog;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  });

  function cancel() {
    open = false;
  }

  function confirm() {
    open = false;
    onconfirm();
  }
</script>

<dialog
  class="confirm font-serif"
  bind:this={dialog}
  aria-labelledby="confirm-title"
  onclick={(event) => event.target === dialog && cancel()}
  onclose={() => (open = false)}
>
  <h2 id="confirm-title">{title}</h2>
  <p>{message}</p>
  <div class="bar">
    <button type="button" class="solid" onclick={cancel}>{cancelLabel}</button>
    <button type="button" class="text" onclick={confirm}>{confirmLabel}</button>
  </div>
</dialog>

<style>
  .confirm {
    width: min(28rem, calc(100vw - 2rem));
    margin: auto;
    padding: 1.25rem 1.35rem 1.35rem;
    border: 1px solid var(--card-border);
    background: var(--dialog-bg);
    color: var(--ink);
  }

  .confirm::backdrop {
    background: var(--dialog-backdrop);
  }

  h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 500;
  }

  p {
    margin: 0.8rem 0 0;
    color: var(--ink-muted);
    font-size: 1.2rem;
    line-height: 1.4;
  }

  .bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1rem;
    margin-top: 1.25rem;
  }
</style>
