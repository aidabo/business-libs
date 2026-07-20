import React, { useEffect, useRef, useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import { ESTATE_EVENTS } from "./types";

export interface InquiryDispatcherProps {
  /** Event to listen for (default: estate:inquiry:submitted). */
  event?: string;
  /** Endpoint to POST the inquiry payload to. */
  endpoint?: string;
  method?: string;
  /** Optional envelope key: when set, body becomes `{ [wrapKey]: [payload] }`
   *  (Ghost-style). When empty, the payload is posted as-is. */
  bodyWrapKey?: string;
  /** Show a small status line on submit result. */
  showStatus?: boolean;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
  style?: React.CSSProperties;
  _componentDesc?: string;
  __stackpage?: StackPageRuntimeApi;
}

type DispatchStatus = "idle" | "sending" | "success" | "error";

/**
 * Invisible-ish page utility: subscribes to the inquiry event emitted by
 * InquiryForm in StackPage mode and actually POSTs it to the backend. Place one
 * per page. See docs/platform/stackpage-event-guide.md.
 */
const InquiryDispatcher: React.FC<InquiryDispatcherProps> = ({
  event = ESTATE_EVENTS.inquirySubmitted,
  endpoint = "/api/estate/inquiries",
  method = "POST",
  bodyWrapKey = "",
  showStatus = true,
  successMessage,
  errorMessage,
  className = "",
  style,
  _componentDesc,
  __stackpage,
}) => {
  const t = useT();
  const [status, setStatus] = useState<DispatchStatus>("idle");
  // Keep the latest config for the subscription handler without re-subscribing.
  const cfgRef = useRef({ endpoint, method, bodyWrapKey });
  cfgRef.current = { endpoint, method, bodyWrapKey };

  useEffect(() => {
    if (!__stackpage?.subscribe) return;

    const unsubscribe = __stackpage.subscribe(event, (payload: any) => {
      const { endpoint: ep, method: m, bodyWrapKey: wrap } = cfgRef.current;
      const body = wrap ? { [wrap]: [payload] } : payload;
      setStatus("sending");
      fetch(ep, {
        method: m || "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then((res) => {
          setStatus(res.ok ? "success" : "error");
          if (!res.ok) {
            console.error(
              `[InquiryDispatcher] POST ${ep} failed: ${res.status}`
            );
          }
        })
        .catch((err) => {
          console.error("[InquiryDispatcher] inquiry POST failed:", err);
          setStatus("error");
        });
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
    // Re-subscribe only when the event name or runtime changes.
  }, [__stackpage, event]);

  const label = t(_componentDesc || "問い合わせ送信ハンドラ");
  const statusText =
    status === "sending"
      ? t("Submitting…")
      : status === "success"
        ? successMessage
          ? t(successMessage)
          : t("Inquiry sent")
        : status === "error"
          ? errorMessage
            ? t(errorMessage)
            : t("Submission failed")
          : "";

  const statusColor =
    status === "success"
      ? "text-green-700 bg-green-50 border-green-200"
      : status === "error"
        ? "text-red-700 bg-red-50 border-red-200"
        : "text-gray-600 bg-gray-50 border-gray-200";

  return (
    <div className={`w-full ${className}`} style={style}>
      <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-gray-300 bg-white px-3 py-1 text-xs text-gray-500">
        <PaperAirplaneIcon className="h-4 w-4" />
        <span>{label}</span>
        <code className="text-[10px] text-gray-400">{event}</code>
      </div>
      {showStatus && statusText && (
        <div
          className={`mt-2 inline-block rounded-md border px-3 py-1 text-sm ${statusColor}`}
        >
          {statusText}
        </div>
      )}
    </div>
  );
};

export default InquiryDispatcher;
