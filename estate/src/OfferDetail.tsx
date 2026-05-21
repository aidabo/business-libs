import React from "react";
import { useT } from "./hooks/useTranslation";
import { ClockIcon, ExclamationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export interface OfferDetailProps {
  title?: string;
  description?: string;
  terms?: string[];
  expirationDate?: string;
  code?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
}

const OfferDetail: React.FC<OfferDetailProps> = ({
  title = "50% Off Listing Fee",
  description = "For a limited time, we are offering a 50% discount on our standard listing fee for new clients who sign up for our premium selling package. This includes professional photography, 3D tours, and featured listings on major real estate platforms.",
  terms = [
    "Valid for new clients only.",
    "Must sign an exclusive right-to-sell agreement.",
    "Property must be located within our service area.",
    "Cannot be combined with other offers.",
  ],
  expirationDate = "2025-12-31",
  code = "SAVE50",
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

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto my-8 ${className}`}
      style={mergedStyle}
    >
      <div className="bg-blue-50 p-8 border-b border-blue-100">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">{t(title)}</h2>
        <p className="text-lg text-blue-800 leading-relaxed opacity-90">{t(description)}</p>

        {code && (
          <div className="mt-6 inline-flex items-center bg-white border border-blue-200 rounded-lg p-1 pr-4 shadow-sm">
            <div className="bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded text-sm uppercase tracking-wider mr-3">
              {t("Code")}
            </div>
            <span className="font-mono text-xl font-bold text-gray-800">{code}</span>
          </div>
        )}
      </div>

      <div className="p-8 grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 text-gray-500 mr-2" />
            {t("Terms & Conditions")}
          </h3>
          <ul className="space-y-3">
            {terms.map((term, index) => (
              <li key={index} className="flex items-start text-gray-600 text-sm">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 shrink-0" />
                <span>{t(term)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
            {t("Offer Validity")}
          </h3>
          <p className="text-gray-600 mb-4">
            {t("This offer is valid until:")} <span className="font-semibold text-gray-900">{expirationDate}</span>
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500 italic">
            {t("Rights reserved to modify or cancel this offer at any time without prior notice.")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetail;
