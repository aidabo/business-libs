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
  /** JSON list of properties the visitor picked for a bulk inquiry. */
  inquiryProperties: "estate.inquiry.properties",
} as const;

/** Event names for estate page-builder communication */
export const ESTATE_EVENTS = {
  propertySelected: "estate:property:selected",
  searchChanged: "estate:search:changed",
  inquirySubmitted: "estate:inquiry:submitted",
  inquirySelectionChanged: "estate:inquiry:selection:changed",
  detailOpen: "estate:detail:open",
} as const;

/** A property picked for inquiry (minimal, serialized in shared state). */
export interface InquiryPropertyRef {
  id: string;
  title?: string;
  price?: string;
  address?: string;
}

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
  selectedItem?: { id: string; price?: string; address?: string } | null,
  properties?: InquiryPropertyRef[] | null
) {
  const list: InquiryPropertyRef[] =
    Array.isArray(properties) && properties.length > 0
      ? properties
      : selectedItem?.id
        ? [{ id: selectedItem.id, price: selectedItem.price, address: selectedItem.address }]
        : [];
  const primary = list[0];
  return {
    ...form,
    submittedAt: new Date().toISOString(),
    // Backward-compatible single-property fields (first selection).
    propertyId: primary?.id || "",
    propertyPrice: primary?.price || "",
    propertyAddress: primary?.address || "",
    // Multi-select inquiry.
    propertyIds: list.map((p) => p.id).filter(Boolean),
    properties: list.map((p) => ({
      id: p.id,
      title: p.title || "",
      price: p.price || "",
      address: p.address || "",
    })),
  };
}

/** Read the inquiry property list from shared state (tolerates JSON string / array). */
export function readInquiryProperties(
  stackpage: StackPageRuntimeApi | undefined | null,
  key: string = ESTATE_STATE_KEYS.inquiryProperties
): InquiryPropertyRef[] {
  let arr: any = getPageState<any>(stackpage, key, []);
  if (typeof arr === "string") {
    const text = arr.trim();
    if (!text) return [];
    try {
      arr = JSON.parse(text);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v): InquiryPropertyRef | null =>
      v && typeof v === "object" && v.id
        ? {
            id: String(v.id),
            title: v.title != null ? String(v.title) : undefined,
            price: v.price != null ? String(v.price) : undefined,
            address: v.address != null ? String(v.address) : undefined,
          }
        : null
    )
    .filter((v): v is InquiryPropertyRef => v !== null);
}

/** Write the inquiry property list to shared state as a JSON string. */
export function writeInquiryProperties(
  stackpage: StackPageRuntimeApi | undefined | null,
  list: InquiryPropertyRef[],
  key: string = ESTATE_STATE_KEYS.inquiryProperties
) {
  setPageState(stackpage, key, JSON.stringify(list));
}

/** Toggle a property in the inquiry list; returns the new list. */
export function toggleInquiryProperty(
  stackpage: StackPageRuntimeApi | undefined | null,
  ref: InquiryPropertyRef,
  key: string = ESTATE_STATE_KEYS.inquiryProperties
): InquiryPropertyRef[] {
  const list = readInquiryProperties(stackpage, key);
  const idx = list.findIndex((p) => p.id === ref.id);
  const next = idx >= 0 ? list.filter((_, i) => i !== idx) : [...list, ref];
  writeInquiryProperties(stackpage, next, key);
  return next;
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
