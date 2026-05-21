import React, { useState } from "react";
import { useT } from "./hooks/useTranslation";

export interface PortalContactFormProps {
  title?: string;
  submitLabel?: string;
  endpoint?: string;
  recipient?: string;
  className?: string;
  style?: React.CSSProperties;
}

const PortalContactForm: React.FC<PortalContactFormProps> = ({
  title,
  submitLabel,
  endpoint = "/api/portal/contact",
  recipient = "support@example.com",
  className = "",
  style,
}) => {
  const t = useT();
  const [payload, setPayload] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, recipient }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setPayload({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className={`rounded-xl border border-gray-200 bg-white p-5 ${className}`} style={style}>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title || t("Contact")}</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="text"
          value={payload.name}
          onChange={(e) => setPayload((prev) => ({ ...prev, name: e.target.value }))}
          placeholder={t("Name")}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
        <input
          type="email"
          value={payload.email}
          onChange={(e) => setPayload((prev) => ({ ...prev, email: e.target.value }))}
          placeholder={t("Email")}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
        <textarea
          value={payload.message}
          onChange={(e) => setPayload((prev) => ({ ...prev, message: e.target.value }))}
          placeholder={t("Message")}
          className="min-h-28 w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
        {status === "success" && <div className="text-sm text-green-700">{t("Sent successfully.")}</div>}
        {status === "error" && <div className="text-sm text-red-700">{t("Failed to send.")}</div>}
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {status === "loading" ? t("Sending...") : submitLabel || t("Send")}
        </button>
      </form>
    </section>
  );
};

export default PortalContactForm;
