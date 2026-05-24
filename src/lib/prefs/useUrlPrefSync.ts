'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { usePrefs } from './usePrefs';

type PrefsState = ReturnType<typeof usePrefs.getState>;
type PrefsKey = keyof Omit<PrefsState, 'patch'>;

type FieldConfig = {
  key: PrefsKey;
  parse: (raw: string) => unknown;
  /** Convert store value back to URL string. Return null to omit param. Default: String(v). */
  format?: (val: unknown) => string | null;
  /**
   * If true, this field is NOT auto-pushed to URL on mount.
   * It appears in URL only when explicitly set via updateUrl().
   * Default: false (i.e. always present in URL — for primary tabs).
   */
  optional?: boolean;
};

type ParserConfig = Record<string, FieldConfig>;

function defaultFormat(val: unknown): string | null {
  if (val === null || val === undefined || val === '') return null;
  return String(val);
}

/**
 * Two-way sync between URL search params and Zustand prefs store.
 *
 * On mount:
 *   1. Hydrate Zustand from URL (for all listed params).
 *   2. Build target URL:
 *      - Non-optional fields → always pushed (e.g. ?tab=...).
 *      - Optional fields → kept only if URL already had them.
 *
 * updateUrl(patch) — explicit user changes update URL directly.
 */
export function useUrlPrefSync(config: ParserConfig) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const patch = usePrefs((s) => s.patch);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    // 1. URL → Zustand
    const fromUrl: Record<string, unknown> = {};
    for (const [param, { key, parse }] of Object.entries(config)) {
      const raw = searchParams.get(param);
      if (raw !== null && raw !== '') {
        const parsed = parse(raw);
        if (parsed !== undefined && parsed !== null) {
          fromUrl[key as string] = parsed;
        }
      }
    }
    if (Object.keys(fromUrl).length > 0) patch(fromUrl);

    // 2. Zustand → URL (selective)
    const state = usePrefs.getState() as unknown as Record<string, unknown>;
    const target = new URLSearchParams();
    for (const [param, { key, format, optional }] of Object.entries(config)) {
      // Optional fields: include only if URL had them (preserve shared link state).
      if (optional && searchParams.get(param) === null) continue;
      const val = state[key];
      const formatted = (format ?? defaultFormat)(val);
      if (formatted !== null) {
        target.set(param, formatted);
      }
    }

    // Preserve unknown params that aren't in our config (defensive).
    searchParams.forEach((value, key) => {
      if (!(key in config) && !target.has(key)) {
        target.set(key, value);
      }
    });

    const newQuery = target.toString();
    if (newQuery !== searchParams.toString()) {
      router.replace(newQuery ? `${pathname}?${newQuery}` : pathname, {
        scroll: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateUrl(urlPatch: Record<string, string | number | null | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(urlPatch)) {
      if (v === null || v === undefined || v === '') {
        params.delete(k);
      } else {
        params.set(k, String(v));
      }
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return { updateUrl };
}
