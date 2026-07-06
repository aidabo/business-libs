import React, { useState, useEffect } from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import {
  ESTATE_STATE_KEYS,
  ESTATE_EVENTS,
  buildInquiryEventPayload,
  getPageState,
  readInquiryProperties,
  writeInquiryProperties,
} from "./types";

export interface InquiryFormProps {
  title?: string;
  submitLabel?: string;
  /** API endpoint the inquiry is POSTed to (saved to estate_inquiries). */
  endpoint?: string;
  selectedPropertyIdKey?: string;
  inquiryPropertiesKey?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

const InquiryForm: React.FC<InquiryFormProps> = ({
  title,
  submitLabel,
  endpoint = "/api/estate/inquiries",
  selectedPropertyIdKey = ESTATE_STATE_KEYS.selectedPropertyId,
  inquiryPropertiesKey = ESTATE_STATE_KEYS.inquiryProperties,
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

  const selectedId = String(getPageState(__stackpage, selectedPropertyIdKey, ""));
  const selectedItem = selectedId ? { id: selectedId } : null;
  const inquiryProperties = readInquiryProperties(__stackpage, inquiryPropertiesKey);

  const displayTitle = title || t("Interested in this property?");
  const displaySubmitLabel = submitLabel || t("Send Message");
  const [param, setParam] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Re-render when the selection changes elsewhere (PropertyGrid checkboxes emit
  // this event) so the selected-property chips stay in sync even if the host does
  // not re-render this widget on shared-state writes.
  const [, forceSelectionSync] = useState(0);
  useEffect(() => {
    if (!__stackpage?.subscribe) return;
    const unsubscribe = __stackpage.subscribe(
      ESTATE_EVENTS.inquirySelectionChanged,
      () => forceSelectionSync((n) => n + 1)
    );
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [__stackpage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const payload = buildInquiryEventPayload(param, selectedItem, inquiryProperties);

    try {
      // Save the inquiry via the API and only show success once it is persisted.
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      setParam({ name: "", email: "", phone: "", message: "" });
      if (__stackpage) {
        // Clear the picked properties and notify listeners the inquiry was saved.
        writeInquiryProperties(__stackpage, [], inquiryPropertiesKey);
        __stackpage.emit?.(ESTATE_EVENTS.inquirySubmitted, payload);
      }
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error("Failed to send inquiry:", error);
      setStatus("error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setParam((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className={`bg-white p-8 rounded-xl shadow-md border border-gray-200 ${className}`}
      style={mergedStyle}
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-6">{displayTitle}</h3>
      {inquiryProperties.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 text-sm font-medium text-gray-700">
            {t("Selected properties")} ({inquiryProperties.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {inquiryProperties.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {p.title || p.id}
                <button
                  type="button"
                  aria-label={t("Remove")}
                  onClick={() =>
                    writeInquiryProperties(
                      __stackpage,
                      inquiryProperties.filter((x) => x.id !== p.id),
                      inquiryPropertiesKey
                    )
                  }
                  className="text-blue-400 transition hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Full Name")}
          </label>
          <input
            type="text"
            name="name"
            value={param.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Email Address")}
          </label>
          <input
            type="email"
            name="email"
            value={param.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Phone Number")}
          </label>
          <input
            type="tel"
            name="phone"
            value={param.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Message")}
          </label>
          <textarea
            rows={4}
            name="message"
            value={param.message}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder={t("I am interested in this property...")}
          />
        </div>

        {status === "error" && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {t("Something went wrong. Please try again later.")}
          </div>
        )}

        {status === "success" && (
          <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {t("Thank you! Your message has been sent successfully.")}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className={`w-full font-bold py-3 px-6 rounded-lg transition-colors duration-200 mt-4 
            ${status === "loading" || status === "success"
              ? "bg-gray-400 cursor-not-allowed text-gray-100"
              : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
          {status === "loading" ? t("Sending...") : displaySubmitLabel}
        </button>
        <p className="text-xs text-gray-500 text-center mt-4">
          {t("By clicking send, you agree to our Terms of Use and Privacy Policy.")}
        </p>
      </form>
    </div>
  );
};

export default InquiryForm;
