import React, { useState } from "react";
import { useT } from "./hooks/useTranslation";

export interface PortalSupportFormProps {
  title?: string;
  endpoint?: string;
  priorityOptions?: string[];
  className?: string;
  style?: React.CSSProperties;
}

const PortalSupportForm: React.FC<PortalSupportFormProps> = ({
  title,
  endpoint = "/api/portal/support",
  priorityOptions = ["low", "normal", "high"],
  className = "",
  style,
}) => {
  const t = useT();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [payload, setPayload] = useState({
    subject: "",
    detail: "",
    priority: priorityOptions[1] || "normal",
  });

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
      if (res.ok) {
        setPayload({ subject: "", detail: "", priority: priorityOptions[1] || "normal" });
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className={`rounded-xl border border-gray-200 bg-white p-5 ${className}`} style={style}>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title || t("Support Request")}</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="text"
          value={payload.subject}
          onChange={(e) => setPayload((prev) => ({ ...prev, subject: e.target.value }))}
          placeholder={t("Subject")}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
        <select
          value={payload.priority}
          onChange={(e) => setPayload((prev) => ({ ...prev, priority: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        >
          {priorityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <textarea
          value={payload.detail}
          onChange={(e) => setPayload((prev) => ({ ...prev, detail: e.target.value }))}
          placeholder={t("Describe the issue")}
          className="min-h-28 w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
        {status === "success" && <div className="text-sm text-green-700">{t("Request submitted.")}</div>}
        {status === "error" && <div className="text-sm text-red-700">{t("Submission failed.")}</div>}
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {status === "loading" ? t("Sending...") : t("Submit")}
        </button>
      </form>
    </section>
  );
};

export default PortalSupportForm;
