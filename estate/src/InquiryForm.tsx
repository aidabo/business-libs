import React, { useState } from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import { ESTATE_STATE_KEYS, ESTATE_EVENTS, buildInquiryEventPayload, getPageState } from "./types";

export interface InquiryFormProps {
  title?: string;
  submitLabel?: string;
  selectedPropertyIdKey?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

const InquiryForm: React.FC<InquiryFormProps> = ({
  title,
  submitLabel,
  selectedPropertyIdKey = ESTATE_STATE_KEYS.selectedPropertyId,
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

  const displayTitle = title || t("Interested in this property?");
  const displaySubmitLabel = submitLabel || t("Send Message");
  const [param, setParam] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    if (__stackpage) {
      __stackpage.emit(
        ESTATE_EVENTS.inquirySubmitted,
        buildInquiryEventPayload(param, selectedItem)
      );
      setStatus("success");
      setParam({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
      return;
    }

    try {
      const response = await fetch("/api/estate/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(param),
      });

      if (response.ok) {
        setStatus("success");
        setParam({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
      }
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
