import React, { useState } from "react";
import { useT } from "./hooks/useTranslation";

export interface SaleInquiryProps {
  title?: string;
  description?: string;
  submitLabel?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SaleInquiry: React.FC<SaleInquiryProps> = ({
  title,
  description,
  submitLabel,
  backgroundColor,
  fontSize,
  className = "",
  style,
}) => {
  const t = useT();

  const mergedStyle: React.CSSProperties = {
    backgroundColor,
    fontSize,
    ...style,
  };

  const displayTitle = title || t("Request a Free Property Valuation");
  const displayDescription = description || t("Fill out the form below and we will get back to you with a comprehensive market analysis.");
  const displaySubmitLabel = submitLabel || t("Get My Valuation");
  const [param, setParam] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    propertyType: "house",
    approxSqft: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setParam({ name: "", email: "", phone: "", address: "", propertyType: "house", approxSqft: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParam((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-gray-100 ${className}`}
      style={mergedStyle}
    >
      <div className="bg-blue-900 py-8 px-8 text-center">
        <h3 className="text-3xl font-bold text-white mb-2">{displayTitle}</h3>
        <p className="text-blue-100">{displayDescription}</p>
      </div>

      <div className="p-8 md:p-12">
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
              {status === "loading" ? t("Sending...") : (displaySubmitLabel)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleInquiry;
