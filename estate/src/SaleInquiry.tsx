import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import { ESTATE_EVENTS } from "./types";

export interface SaleInquiryProps {
  title?: string;
  description?: string;
  submitLabel?: string;
  /** Endpoint the assessment request is POSTed to. */
  endpoint?: string;
  /**
   * Render as a dialog instead of an inline card. When true the form is hidden
   * until `openEvent` is received (e.g. SaleHero's CTA), then shown as a modal.
   */
  asDialog?: boolean;
  /** Event that opens the dialog (SaleHero emits it). */
  openEvent?: string;
  /** Also broadcast estate:inquiry:submitted on submit (for InquiryDispatcher etc.). */
  emitOnSubmit?: boolean;
  /** When set, a close (✕) button is shown and this is called on close / after a
   *  successful submit. Lets a parent (e.g. SaleHero) host the form in its own modal. */
  onClose?: () => void;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

const SaleInquiry: React.FC<SaleInquiryProps> = ({
  title,
  description,
  submitLabel,
  endpoint = "/api/estate/inquiries",
  asDialog = false,
  openEvent = ESTATE_EVENTS.saleAssessmentOpen,
  emitOnSubmit = true,
  onClose,
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}) => {
  const t = useT();

  const mergedStyle: React.CSSProperties = {
    backgroundColor,
    fontSize,
    ...style,
  };

  const displayTitle = title || t("Request a Free Property Valuation");
  const displayDescription =
    description ||
    t("Fill out the form below and we will get back to you with a comprehensive market analysis.");
  const displaySubmitLabel = submitLabel || t("Get My Valuation");

  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    address: "",
    propertyType: "house",
    approxSqft: "",
    message: "",
  };
  const [param, setParam] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [open, setOpen] = useState(false);

  // Close = call the parent's onClose (host-managed modal) or close our own dialog.
  const close = () => {
    if (onClose) onClose();
    else setOpen(false);
  };
  const showClose = asDialog || !!onClose;

  // Dialog mode: open when SaleHero (or anyone) emits the open event.
  useEffect(() => {
    if (!asDialog || !__stackpage?.subscribe) return;
    const unsubscribe = __stackpage.subscribe(openEvent, () => {
      setStatus("idle");
      setOpen(true);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [asDialog, openEvent, __stackpage]);

  const endpointRef = useRef(endpoint);
  endpointRef.current = endpoint;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const payload = {
      ...param,
      // Keep an inquiries-compatible `message` while preserving the sale fields.
      message: [
        param.message,
        param.propertyType ? `${t("Property Type")}: ${param.propertyType}` : "",
        param.address ? `${t("Property Address")}: ${param.address}` : "",
        param.approxSqft ? `${t("Approx. Sqft (Optional)")}: ${param.approxSqft}` : "",
      ]
        .filter(Boolean)
        .join(" / "),
      source: "sale-assessment",
    };

    // StackPage rule: also broadcast so an InquiryDispatcher/listeners can react.
    if (emitOnSubmit && __stackpage?.emit) {
      __stackpage.emit(ESTATE_EVENTS.inquirySubmitted, payload);
    }

    try {
      const res = await fetch(endpointRef.current, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("success");
      setParam(emptyForm);
      // In dialog / host-modal mode, close shortly after success.
      if (showClose) setTimeout(close, 2500);
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      console.error("[SaleInquiry] submit failed:", err);
      setStatus("error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setParam((prev) => ({ ...prev, [name]: value }));
  };

  const formBody = (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("Full Name")}</label>
          <input
            type="text"
            name="name"
            value={param.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("Email Address")}</label>
          <input
            type="email"
            name="email"
            value={param.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("Phone Number")}</label>
          <input
            type="tel"
            name="phone"
            value={param.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("Property Address")}</label>
          <input
            type="text"
            name="address"
            value={param.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("Property Type")}</label>
          <select
            name="propertyType"
            value={param.propertyType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
          >
            <option value="house">{t("House")}</option>
            <option value="condo">{t("Condo / Apartment")}</option>
            <option value="land">{t("Land")}</option>
            <option value="commercial">{t("Commercial")}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("Approx. Sqft (Optional)")}</label>
          <input
            type="text"
            name="approxSqft"
            value={param.approxSqft}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t("Additional Details")}</label>
        <textarea
          rows={4}
          name="message"
          value={param.message}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
          placeholder={t("Tell us more about your property (age, condition, renovations, etc.)...")}
        />
      </div>

      {status === "error" && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm text-center">
          {t("Something went wrong. Please try again later.")}
        </div>
      )}

      {status === "success" && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg text-sm text-center">
          {t("Thank you! We have received your request and will contact you shortly.")}
        </div>
      )}

      <div className="text-center pt-2">
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className={`min-w-[200px] font-bold py-4 px-8 rounded-full transition-colors duration-200 shadow-lg text-lg
            ${status === "loading" || status === "success"
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"}`}
        >
          {status === "loading" ? t("Sending...") : displaySubmitLabel}
        </button>
      </div>
    </form>
  );

  const card = (
    <div
      className={`bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-gray-100 ${className}`}
      style={mergedStyle}
    >
      <div className="bg-blue-900 py-8 px-8 text-center relative">
        <h3 className="text-3xl font-bold text-white mb-2">{displayTitle}</h3>
        <p className="text-blue-100">{displayDescription}</p>
        {showClose && (
          <button
            type="button"
            onClick={close}
            aria-label={t("閉じる")}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <XMarkIcon className="h-7 w-7" />
          </button>
        )}
      </div>

      <div className="p-8 md:p-12">{formBody}</div>
    </div>
  );

  // ── Inline card (default) ────────────────────────────────────────
  if (!asDialog) return card;

  // ── Dialog mode ──────────────────────────────────────────────────
  return (
    <>
      {/* Selectable presence in the editor / when closed on a live page. */}
      {!open && (
        <div className={`w-full ${className}`} style={style}>
          <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-gray-300 bg-white px-3 py-1 text-xs text-gray-500">
            {t("査定ダイアログ")} <code className="text-[10px] text-gray-400">{openEvent}</code>
          </span>
        </div>
      )}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
            onClick={() => setOpen(false)}
            role="presentation"
          >
            <div
              className="w-full max-w-4xl my-8"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {card}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default SaleInquiry;
