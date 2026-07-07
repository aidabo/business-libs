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
  const [result, setResult] = useState<{
    referenceCode: string;
    propertyNames: string[];
    inquiryId: string;
  } | null>(null);
  // Whether the customer confirmation email was sent (null = unknown/not applicable).
  const [customerMailOk, setCustomerMailOk] = useState<boolean | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }>({});

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isValidPhone = (v: string) => {
    const cleaned = v.replace(/[\s\-().]/g, "");
    // Domestic JP (0 + 9-10 digits) or international (+ and 10-15 digits).
    return /^0\d{9,10}$/.test(cleaned) || /^\+\d{10,15}$/.test(cleaned);
  };
  const validateForm = () => {
    const errors: { name?: string; email?: string; phone?: string; message?: string } = {};
    if (!param.name.trim()) errors.name = t("お名前を入力してください。");
    if (!param.email.trim()) errors.email = t("メールアドレスを入力してください。");
    else if (!isValidEmail(param.email))
      errors.email = t("正しいメールアドレスを入力してください。");
    if (param.phone.trim() && !isValidPhone(param.phone))
      errors.phone = t("正しい電話番号を入力してください（例: 090-1234-5678）。");
    if (!param.message.trim()) errors.message = t("お問い合わせ内容を入力してください。");
    return errors;
  };

  const readCustomerMailOk = (inquiry: any): boolean | null => {
    try {
      const meta =
        typeof inquiry?.metadata === "string" ? JSON.parse(inquiry.metadata) : inquiry?.metadata;
      const customer = meta?.notifications?.customer;
      return customer ? !!customer.ok : null;
    } catch {
      return null;
    }
  };

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

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
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

      // Show the customer their reference code + the properties they inquired about.
      const json = await response.json().catch(() => ({} as any));
      const inquiry = json?.estateinquiries?.[0] || {};
      const referenceCode = String(inquiry.reference_code || json?.reference_code || "");
      const inquiryId = String(inquiry.id || "");
      const propertyNames = inquiryProperties
        .map((p) => p.title)
        .filter((v): v is string => !!v);
      const mailOk = readCustomerMailOk(inquiry);

      setResult({ referenceCode, propertyNames, inquiryId });
      setCustomerMailOk(mailOk);
      setResendEmail(param.email);
      setResendStatus("idle");

      setStatus("success");
      setParam({ name: "", email: "", phone: "", message: "" });
      if (__stackpage) {
        // Clear the picked properties and notify listeners the inquiry was saved.
        writeInquiryProperties(__stackpage, [], inquiryPropertiesKey);
        __stackpage.emit?.(ESTATE_EVENTS.inquirySubmitted, {
          ...payload,
          reference_code: referenceCode,
        });
      }
      // Keep the panel visible (for the resend prompt) when the customer email failed.
      if (mailOk !== false) {
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch (error) {
      console.error("Failed to send inquiry:", error);
      setStatus("error");
    }
  };

  const handleResend = async () => {
    const email = resendEmail.trim();
    if (!result?.inquiryId || !email) return;
    setResendStatus("loading");
    try {
      const res = await fetch(
        `/api/estate/inquiries/${encodeURIComponent(result.inquiryId)}/resend-confirmation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      if (!res.ok) {
        setResendStatus("error");
        return;
      }
      const json = await res.json().catch(() => ({} as any));
      const ok = readCustomerMailOk(json?.estateinquiries?.[0] || {}) === true;
      setCustomerMailOk(ok);
      setResendStatus(ok ? "success" : "error");
    } catch (error) {
      console.error("Failed to resend confirmation:", error);
      setResendStatus("error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setParam((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => (prev[name as keyof typeof prev] ? { ...prev, [name]: undefined } : prev));
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
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Full Name")}
          </label>
          <input
            type="text"
            name="name"
            value={param.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${fieldErrors.name ? "border-red-400" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
            placeholder="John Doe"
          />
          {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
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
            className={`w-full px-4 py-2 border ${fieldErrors.email ? "border-red-400" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
            placeholder="john@example.com"
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
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
            className={`w-full px-4 py-2 border ${fieldErrors.phone ? "border-red-400" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
            placeholder="090-1234-5678"
          />
          {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
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
            className={`w-full px-4 py-2 border ${fieldErrors.message ? "border-red-400" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none`}
            placeholder={t("I am interested in this property...")}
          />
          {fieldErrors.message && <p className="mt-1 text-xs text-red-600">{fieldErrors.message}</p>}
        </div>

        {status === "error" && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {t("Something went wrong. Please try again later.")}
          </div>
        )}

        {status === "success" && (
          <div className="space-y-2">
            <div className="space-y-1 rounded-lg bg-green-100 p-3 text-sm text-green-800">
              <div className="font-medium">
                {t("お問い合わせを受け付けました。担当者より折り返しご連絡いたします。")}
              </div>
              {result?.referenceCode && (
                <div>
                  {t("受付番号")}:{" "}
                  <span className="font-semibold tracking-wide">{result.referenceCode}</span>
                </div>
              )}
              {result?.propertyNames && result.propertyNames.length > 0 && (
                <div>
                  {t("対象物件")}: {result.propertyNames.join(" / ")}
                </div>
              )}
            </div>

            {customerMailOk === false && (
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <div>
                  {t(
                    "確認メールを送信できませんでした。メールアドレスをご確認のうえ再送信してください。"
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-1.5 outline-none focus:ring-2 focus:ring-amber-200"
                  />
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendStatus === "loading" || !resendEmail.trim()}
                    className="rounded-lg bg-amber-600 px-4 py-1.5 font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
                  >
                    {resendStatus === "loading" ? t("送信中...") : t("確認メール再送信")}
                  </button>
                </div>
                {resendStatus === "error" && (
                  <div className="text-red-700">
                    {t("再送信に失敗しました。アドレスをご確認ください。")}
                  </div>
                )}
              </div>
            )}

            {customerMailOk === true && resendStatus === "success" && (
              <div className="rounded-lg bg-green-100 p-3 text-sm text-green-800">
                {t("確認メールを再送信しました。")}
              </div>
            )}
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
