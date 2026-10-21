import React, { useState } from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";

export interface RenovationInquiryFormProps {
  title?: string;
  description?: string;
  submitLabel?: string;
  endpoint?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

const RenovationInquiryForm: React.FC<RenovationInquiryFormProps> = ({
  title = "無料リフォーム相談",
  description = "リフォーム・リノベーションのご希望をお聞かせください。現地調査・お見積りは無料です。",
  submitLabel = "無料相談を申し込む",
  endpoint = "/api/estate/inquiries",
  backgroundColor,
  fontSize,
  className = "",
  style,
}) => {
  const t = useT();
  const scopeLabelKeys: Record<string, string> = {
    "full-renovation": "Full renovation",
    "kitchen-bathroom": "Kitchen / bathroom",
    interior: "Interior / wallpaper",
    "exterior-roof": "Exterior / roof",
    other: "Other",
  };
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    scope: "full-renovation",
    budget: "",
    timing: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [referenceCode, setReferenceCode] = useState("");

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setReferenceCode("");
    const details = [
      t("Renovation scope") + ": " + (form.scope ? t(scopeLabelKeys[form.scope] || form.scope) : ""),
      form.address ? t("Property Address") + ": " + form.address : "",
      form.budget ? t("Budget") + ": " + form.budget : "",
      form.timing ? t("Desired timing") + ": " + form.timing : "",
      form.message ? t("Message") + ": " + form.message : "",
    ].filter(Boolean).join("\n");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          message: details,
          source: "renovation-consultation",
          inquiry_type: "renovation_consultation",
          metadata: { address: form.address, scope: form.scope, budget: form.budget, timing: form.timing },
        }),
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const json = await response.json().catch(() => ({} as any));
      const inquiry = json?.estateinquiries?.[0] || {};
      setReferenceCode(String(inquiry.reference_code || json?.reference_code || "").trim());
      setForm({ name: "", email: "", phone: "", address: "", scope: "full-renovation", budget: "", timing: "", message: "" });
      setStatus("success");
    } catch (error) {
      console.error("[RenovationInquiryForm] submit failed:", error);
      setStatus("error");
    }
  };

  const mergedStyle: React.CSSProperties = { backgroundColor, fontSize, ...style };
  return (
    <section className={"w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 " + className} style={mergedStyle}>
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t(title)}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{t(description)}</p>
        <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-slate-700">
            {t("Full Name")}
            <input required name="name" value={form.name} onChange={update} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t("Email Address")}
            <input required type="email" name="email" value={form.email} onChange={update} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t("Phone Number")}
            <input type="tel" name="phone" value={form.phone} onChange={update} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t("Property Address")}
            <input required name="address" value={form.address} onChange={update} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t("Renovation scope")}
            <select name="scope" value={form.scope} onChange={update} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal">
              <option value="full-renovation">{t("Full renovation")}</option>
              <option value="kitchen-bathroom">{t("Kitchen / bathroom")}</option>
              <option value="interior">{t("Interior / wallpaper")}</option>
              <option value="exterior-roof">{t("Exterior / roof")}</option>
              <option value="other">{t("Other")}</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t("Budget")}
            <input name="budget" value={form.budget} onChange={update} placeholder={t("Example: 3 million yen")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            {t("Desired timing")}
            <input name="timing" value={form.timing} onChange={update} placeholder={t("Example: within 3 months")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            {t("Message")}
            <textarea name="message" value={form.message} onChange={update} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" disabled={status === "loading"} className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60">
              {status === "loading" ? t("Sending...") : t(submitLabel)}
            </button>
            {status === "success" && (
              <div className="mt-3 space-y-1 text-sm font-medium text-emerald-700">
                <p>{t("Your consultation request has been sent.")}</p>
                {referenceCode ? (
                  <p>
                    {t("Inquiry reference number")}:{" "}
                    <span className="tracking-wide">{referenceCode}</span>
                  </p>
                ) : null}
              </div>
            )}
            {status === "error" && <p className="mt-3 text-sm font-medium text-red-700">{t("Failed to send your request. Please try again.")}</p>}
          </div>
        </form>
      </div>
    </section>
  );
};

RenovationInquiryForm.displayName = "RenovationInquiryForm";
export default RenovationInquiryForm;
