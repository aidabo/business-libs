import React, { useState } from "react";
import { useT } from "./hooks/useTranslation";

export interface PortalEmailFormProps {
  title?: string;
  endpoint?: string;
  to?: string;
  cc?: string;
  className?: string;
  style?: React.CSSProperties;
}

const PortalEmailForm: React.FC<PortalEmailFormProps> = ({
  title,
  endpoint = "/api/portal/send-email",
  to = "",
  cc = "",
  className = "",
  style,
}) => {
  const t = useT();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [payload, setPayload] = useState({ to, cc, subject: "", body: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className={`rounded-xl border border-gray-200 bg-white p-5 ${className}`} style={style}>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title || t("Send Email")}</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          value={payload.to}
          onChange={(e) => setPayload((prev) => ({ ...prev, to: e.target.value }))}
          placeholder={t("To")}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
        <input
          type="text"
          value={payload.cc}
          onChange={(e) => setPayload((prev) => ({ ...prev, cc: e.target.value }))}
          placeholder={t("CC")}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <input
          type="text"
          value={payload.subject}
          onChange={(e) => setPayload((prev) => ({ ...prev, subject: e.target.value }))}
          placeholder={t("Subject")}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
        <textarea
          value={payload.body}
          onChange={(e) => setPayload((prev) => ({ ...prev, body: e.target.value }))}
          placeholder={t("Email body")}
          className="min-h-28 w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
        {status === "success" && <div className="text-sm text-green-700">{t("Email queued.")}</div>}
        {status === "error" && <div className="text-sm text-red-700">{t("Failed to queue email.")}</div>}
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {status === "loading" ? t("Sending...") : t("Send")}
        </button>
      </form>
    </section>
  );
};

export default PortalEmailForm;
