type Entry<T> = { value: T; expires: number };

const store = new Map<string, Entry<unknown>>();

/** Short-lived in-memory cache so admin refreshes stay cheap. */
export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > Date.now()) return hit.value;

  const value = await load();
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

export function bustCache(prefix?: string) {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
