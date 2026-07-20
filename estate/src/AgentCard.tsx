import React, { useState } from "react";
import { createPortal } from "react-dom";
import { PhoneIcon, EnvelopeIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useT } from "./hooks/useTranslation";
import { ESTATE_EVENTS, type StackPageRuntimeApi } from "./types";

export interface AgentCardProps {
  name?: string;
  title?: string;
  image?: string;
  phone?: string;
  email?: string;
  bio?: string;
  /** Contact endpoint (Ghost-backed mailer). */
  endpoint?: string;
  /**
   * Recipient staff (担当者) as an opaque Ghost user id, picked by the page author
   * from the staff pulldown. The email is resolved server-side from this id — it is
   * never shown on the card nor chosen by the visitor. When empty the backend falls
   * back to the ESTATE_AGENT_INBOX env var.
   */
  agentUserId?: string;
  /** Link to the privacy-policy page shown in the consent line. */
  privacyPolicyUrl?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Injected by StackPage runtime for event emission. */
  __stackpage?: StackPageRuntimeApi;
}

interface ContactFields {
  email: string;
  company: string;
  companyKana: string;
  name: string;
  nameKana: string;
  phone: string;
  message: string;
  consent: boolean;
  confirmed: boolean;
}

const EMPTY_FIELDS: ContactFields = {
  email: "",
  company: "",
  companyKana: "",
  name: "",
  nameKana: "",
  phone: "",
  message: "",
  consent: false,
  confirmed: false,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AgentCard: React.FC<AgentCardProps> = ({
  name = "Sarah Johnson",
  title = "Senior Real Estate Agent",
  image = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  phone = "+1 (555) 123-4567",
  email = "sarah@example.com",
  bio = "Specializing in luxury properties with over 10 years of experience in the local market.",
  endpoint = "/api/estate/agent-contact",
  agentUserId = "",
  privacyPolicyUrl = "",
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}) => {
  const t = useT();

  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<ContactFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFields, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string>("");

  const mergedStyle: React.CSSProperties = { backgroundColor, fontSize, ...style };

  const setField = <K extends keyof ContactFields>(key: K, value: ContactFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const closeModal = () => {
    setOpen(false);
    setStatus("idle");
    setServerError("");
    setErrors({});
    setFields(EMPTY_FIELDS);
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof ContactFields, string>> = {};
    if (!fields.email.trim()) next.email = t("Please enter your email address.");
    else if (!EMAIL_RE.test(fields.email.trim())) next.email = t("The email address format is invalid.");
    if (!fields.name.trim()) next.name = t("Please enter your name");
    if (!fields.nameKana.trim()) next.nameKana = t("Please enter the phonetic name.");
    if (!fields.phone.trim()) next.phone = t("Please enter your phone number");
    if (!fields.message.trim()) next.message = t("Please enter your inquiry.");
    if (!fields.consent) next.consent = t("Please agree to the Privacy Policy");
    if (!fields.confirmed) next.confirmed = t("Please review your entries");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    if (!validate()) return;

    setStatus("loading");
    setServerError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name.trim(),
          name_kana: fields.nameKana.trim(),
          email: fields.email.trim(),
          phone: fields.phone.trim(),
          company: fields.company.trim() || null,
          company_kana: fields.companyKana.trim() || null,
          message: fields.message.trim(),
          consent: fields.consent,
          agent_name: name,
          agent_user_id: agentUserId || null,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || `HTTP ${res.status}`);
      }
      setStatus("success");
      __stackpage?.emit(ESTATE_EVENTS.agentContactSubmitted, {
        agentName: name,
        name: fields.name.trim(),
        email: fields.email.trim(),
        submittedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setStatus("error");
      setServerError(err?.message || t("Submission failed"));
    }
  };

  const inputCls =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-sm text-gray-700 mb-1";
  const reqMark = <span className="text-red-500 text-xs ml-1">{t("(Required)")}</span>;

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row w-full h-full ${className}`}
      style={mergedStyle}
    >
      <div className="relative h-[40%] min-h-[250px] md:h-full md:w-2/5 shrink-0">
        <img src={image} alt={name} className="w-full h-full object-cover absolute inset-0" />
      </div>
      <div className="p-8 md:w-3/5 flex flex-col justify-center flex-grow">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-blue-600 font-medium mb-4">{t(title)}</p>
        <p className="text-gray-600 mb-6 leading-relaxed">{t(bio)}</p>

        <div className="space-y-3 mt-auto">
          <div className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
            <PhoneIcon className="h-5 w-5 mr-3" />
            <span className="font-medium">{phone}</span>
          </div>
          <div className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
            <EnvelopeIcon className="h-5 w-5 mr-3" />
            <span className="font-medium">{email}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-8 w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {t("Contact Agent")}
        </button>
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-black/50 p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <h4 className="text-lg font-bold text-gray-900">
                  {t("Inquiry")}
                  {name ? ` — ${name}` : ""}
                </h4>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-700"
                  aria-label={t("Close")}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="overflow-y-auto">
                {status === "success" ? (
              <div className="p-8 text-center">
                <p className="text-green-600 font-semibold mb-2">
                  {t("Inquiry sent.")}
                </p>
                <p className="text-gray-600 text-sm mb-6">
                  {t("A representative will contact you shortly.")}
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded-lg"
                >
                  {t("Close")}
                </button>
              </div>
            ) : (
              <form className="p-6 space-y-4" onSubmit={handleSubmit} noValidate>
                <p className="text-sm text-gray-600">
                  {t("If you have any questions, please contact us using the inquiry form below.")}
                </p>

                <div>
                  <label className={labelCls}>
                    {t("Email address")}
                    {reqMark}
                  </label>
                  <input
                    type="email"
                    className={inputCls}
                    placeholder="xxx@xxxxxx.xxx"
                    value={fields.email}
                    onChange={(e) => setField("email", e.target.value)}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className={labelCls}>{t("Company name (corporations only)")}</label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder={t("Example Real Estate Co., Ltd.")}
                    value={fields.company}
                    onChange={(e) => setField("company", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>{t("Company name (phonetic)")}</label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder={t("Example Real Estate")}
                    value={fields.companyKana}
                    onChange={(e) => setField("companyKana", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>
                      {t("Name (representative for corporations)")}
                      {reqMark}
                    </label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder={t("Taro Yamada")}
                      value={fields.name}
                      onChange={(e) => setField("name", e.target.value)}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>
                      {t("Name (phonetic)")}
                      {reqMark}
                    </label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder={t("Taro Yamada")}
                      value={fields.nameKana}
                      onChange={(e) => setField("nameKana", e.target.value)}
                    />
                    {errors.nameKana && (
                      <p className="text-red-500 text-xs mt-1">{errors.nameKana}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>
                    {t("Phone number")}
                    {reqMark}
                  </label>
                  <input
                    type="tel"
                    className={inputCls}
                    placeholder="000-0000-0000"
                    value={fields.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className={labelCls}>
                    {t("Inquiry details")}
                    {reqMark}
                  </label>
                  <textarea
                    rows={5}
                    className={inputCls}
                    value={fields.message}
                    onChange={(e) => setField("message", e.target.value)}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    {t("When making an inquiry")}
                    {privacyPolicyUrl ? (
                      <a
                        href={privacyPolicyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline mx-1"
                      >
                        {t("Privacy Policy")}
                      </a>
                    ) : (
                      <span className="text-blue-600 mx-1">
                        {t("Privacy Policy")}
                      </span>
                    )}
                    {t("Please read and agree to the policy before submitting your inquiry.")}
                  </p>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={fields.consent}
                      onChange={(e) => setField("consent", e.target.checked)}
                    />
                    <span>
                      {t("I agree to the Privacy Policy")}
                      {reqMark}
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="text-red-500 text-xs mt-1">{errors.consent}</p>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    {t("There is no confirmation screen. Review your entries before submitting.")}
                  </p>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={fields.confirmed}
                      onChange={(e) => setField("confirmed", e.target.checked)}
                    />
                    <span>
                      {t("Acknowledged")}
                      {reqMark}
                    </span>
                  </label>
                  {errors.confirmed && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmed}</p>
                  )}
                </div>

                {status === "error" && serverError && (
                  <p className="text-red-500 text-sm">{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-md transition-colors"
                >
                  {status === "loading" ? t("Submitting...") : t("Submit")}
                </button>
              </form>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AgentCard;
