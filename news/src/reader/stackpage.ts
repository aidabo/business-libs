import type { NewsPost } from "../core";

/** StackPage が部品に渡すランタイム（必要な分だけ。stackpage には依らない）。 */
export interface StackPageRuntimeApi {
  emit?: (eventName: string, payload?: unknown) => void;
  subscribe?: (eventName: string, handler: (payload: unknown) => void) => () => void;
  setPageState?: (path: string, value: unknown) => void;
  getPageState?: <T = unknown>(path: string, defaultValue?: T) => T | undefined;
  setState?: (path: string, value: unknown) => void;
  getState?: <T = unknown>(path: string, defaultValue?: T) => T | undefined;
}

export function getPageState<T>(stackpage: StackPageRuntimeApi | undefined, key: string, fallback: T): T {
  return (stackpage?.getPageState?.(key, fallback) ?? stackpage?.getState?.(key, fallback) ?? fallback) as T;
}

export function setPageState(stackpage: StackPageRuntimeApi | undefined, key: string, value: unknown) {
  stackpage?.setPageState?.(key, value);
  stackpage?.setState?.(key, value);
}

/** 結び付けられた配列（items）を受ける。配列でなければ空。 */
export function asArray<T = NewsPost>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
