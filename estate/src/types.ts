/** Lightweight StackPage runtime API type (no dependency on stackpage lib) */
export interface StackPageRuntimeApi {
  widgetId: string;
  emit: (eventName: string, payload?: any) => void;
  emitWithAck: (
    eventName: string,
    payload?: any,
    options?: { responseEvent?: string; timeoutMs?: number }
  ) => Promise<any>;
  subscribe: (
    eventName: string,
    handler: (payload: any, meta: { sourceWidgetId: string; eventName: string }) => void
  ) => () => void;
  unsubscribe: (unsubscribeFn?: (() => void) | null) => void;
  setState: (path: string, value: any) => void;
  getState: <T = any>(path: string, defaultValue?: T) => T | undefined;
  setPageState?: (path: string, value: any) => void;
  getPageState?: <T = any>(path: string, defaultValue?: T) => T | undefined;
}

/** Shared state keys for estate page-builder communication */
export const ESTATE_STATE_KEYS = {
  selectedPropertyId: "estate.selectedPropertyId",
  keyword: "estate.keyword",
  filterIntent: "estate.filter.intent",
  transitionSource: "estate.transition.source",
} as const;

/** Event names for estate page-builder communication */
export const ESTATE_EVENTS = {
  propertySelected: "estate:property:selected",
  searchChanged: "estate:search:changed",
  inquirySubmitted: "estate:inquiry:submitted",
  detailOpen: "estate:detail:open",
} as const;

/** Build a property selection payload for events */
export function buildPropertySelectionEvent(
  item: { id: string; price?: string; address?: string; tag?: string },
  source = "grid"
) {
  return {
    id: item.id,
    price: item.price || "",
    address: item.address || "",
    tag: item.tag || "",
    source,
  };
}

/** Build an inquiry submission payload for events */
export function buildInquiryEventPayload(
  form: { name: string; email: string; phone: string; message: string },
  selectedItem?: { id: string; price?: string; address?: string } | null
) {
  return {
    ...form,
    submittedAt: new Date().toISOString(),
    propertyId: selectedItem?.id || "",
    propertyPrice: selectedItem?.price || "",
    propertyAddress: selectedItem?.address || "",
  };
}

/** Get page state with fallback from stackpage runtime */
export function getPageState<T>(
  stackpage: StackPageRuntimeApi | undefined | null,
  key: string,
  fallback: T
): T {
  return stackpage?.getPageState?.(key, fallback) ?? stackpage?.getState?.(key, fallback) ?? fallback;
}

/** Set page state on stackpage runtime */
export function setPageState(
  stackpage: StackPageRuntimeApi | undefined | null,
  key: string,
  value: any
) {
  stackpage?.setPageState?.(key, value);
  stackpage?.setState?.(key, value);
}
