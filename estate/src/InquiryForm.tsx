import React, { useState, useEffect } from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi, InquiryPropertyRef } from "./types";
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
  const inquiryProperties = readInquiryProperties(__stackpage, inquiryPropertiesKey);

  // The detail page opens as ?item=<property_id>; selectedPropertyId is synced from
  // it on view pages. That property is always the PRIMARY inquiry target (1件). Fetch
  // its name so it shows as a (non-removable) chip alongside any checked similar ones.
  const [currentProperty, setCurrentProperty] = useState<InquiryPropertyRef | null>(null);
  useEffect(() => {
    const id = selectedId.trim();
    if (!id) {
      setCurrentProperty(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/estate/properties-public/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return;
        const p =
          json?.estateproperties?.[0] || json?.estateproperty || json?.property || null;
        setCurrentProperty({
          id,
          title: String(p?.building_name || p?.title || p?.name || "").trim(),
          address: String(p?.address || "").trim(),
          price: String(p?.price_sale || p?.price_rent_monthly || "").trim(),
        });
      })
      .catch(() => {
        // Keep it as a target even if the name lookup fails (backend enriches by id).
        if (!cancelled) setCurrentProperty({ id });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // Merge: current/primary property first, then checked (similar) properties, deduped.
  const effectiveProperties: InquiryPropertyRef[] = (() => {
    const list: InquiryPropertyRef[] = [];
    const seen = new Set<string>();
    const add = (p?: InquiryPropertyRef | null) => {
      const id = String(p?.id || "").trim();
      if (!id || seen.has(id)) return;
      seen.add(id);
      list.push(p as InquiryPropertyRef);
    };
    add(currentProperty);
    inquiryProperties.forEach(add);
    return list;
  })();

  const displayTitle = t(title || "Interested in this property?");
  const displaySubmitLabel = t(submitLabel || "Send Message");
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
    if (!param.name.trim()) errors.name = t("Please enter your name.");
    if (!param.email.trim()) errors.email = t("Please enter your email address.");
    else if (!isValidEmail(param.email))
      errors.email = t("Please enter a valid email address.");
    if (param.phone.trim() && !isValidPhone(param.phone))
      errors.phone = t("Please enter a valid phone number (e.g. 090-1234-5678).");
    if (!param.message.trim()) errors.message = t("Please enter your inquiry.");
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

    const payload = buildInquiryEventPayload(
      param,
      currentProperty || (selectedId ? { id: selectedId } : null),
      inquiryProperties,
    );

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
      const propertyNames = effectiveProperties
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
      {effectiveProperties.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 text-sm font-medium text-gray-700">
            {t("Selected properties")} ({effectiveProperties.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {effectiveProperties.map((p) => {
              // The current/primary property (?item) is the subject of this detail
              // page — always included and not removable. Checked similar ones can
              // be removed individually.
              const isPrimary = !!selectedId && p.id === selectedId;
              return (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {p.title || p.id}
                  {isPrimary ? (
                    <span className="rounded-full bg-blue-100 px-1.5 text-[10px] text-blue-600">
                      {t("This property")}
                    </span>
                  ) : (
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
                  )}
                </span>
              );
            })}
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
                {t("Your inquiry has been received. A representative will contact you.")}
              </div>
              {result?.referenceCode && (
                <div>
                  {t("Inquiry reference number")}:{" "}
                  <span className="font-semibold tracking-wide">{result.referenceCode}</span>
                </div>
              )}
              {result?.propertyNames && result.propertyNames.length > 0 && (
                <div>
                  {t("Property concerned")}: {result.propertyNames.join(" / ")}
                </div>
              )}
            </div>

            {customerMailOk === false && (
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <div>
                  {t(
                    "Unable to send the confirmation email. Check the address and try again."
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
                    {resendStatus === "loading" ? t("Submitting...") : t("Resend confirmation email")}
                  </button>
                </div>
                {resendStatus === "error" && (
                  <div className="text-red-700">
                    {t("Resending failed. Check the address.")}
                  </div>
                )}
              </div>
            )}

            {customerMailOk === true && resendStatus === "success" && (
              <div className="rounded-lg bg-green-100 p-3 text-sm text-green-800">
                {t("Confirmation email resent.")}
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
