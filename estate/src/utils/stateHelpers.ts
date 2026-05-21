import { useState, useEffect, useRef, useCallback } from "react";
import type { StackPageRuntimeApi } from "../types";

export function reconcileOptimisticSharedStringInputState({
  value,
  pendingValue,
  lastExternalValue,
  externalValue,
}: {
  value: string;
  pendingValue: string | null;
  lastExternalValue: string;
  externalValue: string;
}) {
  if (externalValue === lastExternalValue) {
    return { value, pendingValue, lastExternalValue, shouldSetValue: false };
  }

  if (pendingValue !== null) {
    if (externalValue === pendingValue) {
      return {
        value: externalValue,
        pendingValue: null,
        lastExternalValue: externalValue,
        shouldSetValue: true,
      };
    }
    return { value, pendingValue, lastExternalValue: externalValue, shouldSetValue: false };
  }

  return {
    value: externalValue,
    pendingValue: null,
    lastExternalValue: externalValue,
    shouldSetValue: externalValue !== value,
  };
}

export function useOptimisticSharedStringInputState({
  stackpage,
  key,
  fallback,
}: {
  stackpage?: StackPageRuntimeApi;
  key: string;
  fallback: string;
}) {
  const externalValue = String(stackpage?.getPageState?.(key, fallback) || fallback);
  const [value, setValue] = useState(externalValue);
  const pendingValueRef = useRef<string | null>(null);
  const lastExternalValueRef = useRef(externalValue);

  useEffect(() => {
    const next = reconcileOptimisticSharedStringInputState({
      value,
      pendingValue: pendingValueRef.current,
      lastExternalValue: lastExternalValueRef.current,
      externalValue,
    });

    pendingValueRef.current = next.pendingValue;
    lastExternalValueRef.current = next.lastExternalValue;

    if (next.shouldSetValue) {
      setValue(next.value);
    }
  }, [externalValue, value]);

  const updateValue = useCallback((nextValue: string) => {
    pendingValueRef.current = nextValue;
    setValue(nextValue);
  }, []);

  return { value, setValue: updateValue, externalValue };
}
