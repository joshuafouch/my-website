import { untrack } from 'svelte';
import { reducedMotion } from '#lib/motion.svelte.ts';

/**
 * Text that types itself out like a terminal. New text keeps the part it shares with what is
 * shown and types the rest, so ~/blog → ~/blog/theology only types the tag. The rest is cut at
 * once (no backspacing), so stale text never shows under the new page.
 */
type WriteOptions = {
  /** Wait this long before the first character. */
  delay?: number;
  /** Show the text at once. */
  instant?: boolean;
  /** Keep the typed text this long, then erase it. */
  hold?: number;
};

export class Typewriter {
  shown = $state('');
  busy = $state(false);
  #timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    initial = '',
    private typeMs = 42
  ) {
    this.shown = initial;
  }

  /** Untracked, so an effect that calls it does not re-run as the text types. */
  write(text: string, options: WriteOptions = {}) {
    untrack(() => this.#write(text, options));
  }

  #write(text: string, { delay = 0, instant = false, hold }: WriteOptions) {
    this.stop();
    if (instant || reducedMotion()) {
      this.shown = text;
      if (hold !== undefined) this.#timer = setTimeout(() => (this.shown = ''), hold);
      return;
    }

    // With a hold, the text stays that long once typed, then backspaces itself away.
    const erase = () => {
      if (this.shown.length > 0) {
        this.shown = this.shown.slice(0, -1);
        this.#timer = setTimeout(erase, this.typeMs * 0.6);
      } else {
        this.busy = false;
        this.#timer = undefined;
      }
    };

    let shared = 0;
    while (shared < this.shown.length && this.shown[shared] === text[shared]) shared++;
    this.shown = text.slice(0, shared);

    const step = () => {
      const shown = this.shown;
      if (shown.length < text.length) {
        this.shown = text.slice(0, shown.length + 1);
        // A small, uneven rhythm reads as typing rather than a progress bar.
        this.#timer = setTimeout(step, this.typeMs * (0.7 + Math.random() * 0.6));
      } else if (hold !== undefined) {
        this.#timer = setTimeout(erase, hold);
      } else {
        this.busy = false;
        this.#timer = undefined;
      }
    };

    this.busy = true;
    this.#timer = setTimeout(step, delay);
  }

  /** Start over from nothing (an entrance), rather than backspacing what is there. */
  clear() {
    untrack(() => this.stop());
    this.shown = '';
  }

  stop() {
    clearTimeout(this.#timer);
    this.#timer = undefined;
    this.busy = false;
  }
}
