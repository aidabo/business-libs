import React from "react";
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon } from "@heroicons/react/24/solid";
import { useT } from "./hooks/useTranslation";

export interface ContactSectionProps {
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  companyName = "株式会社Think Estate",
  address = "〒123-4567 東京都世田谷区xxx町1-2-3",
  phone = "03-1234-5678",
  email = "info@thinkestate-jp.com",
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
    <div className={`bg-white py-16 ${className}`} style={mergedStyle}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("Inquiry")}</h2>
            <p className="text-lg text-gray-600 mb-8">
              {t("For questions or advice about buying, selling, or renting property, please contact us. Our experienced staff will assist you carefully.")}
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <MapPinIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{t("Location")}</h4>
                  <p className="text-gray-600">{companyName}</p>
                  <p className="text-gray-600">{address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <PhoneIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{t("Phone number")}</h4>
                  <p className="text-gray-600">{phone}</p>
                  <p className="text-sm text-gray-500">{t("Monday–Friday: 9:00–18:00")}</p>
                </div>
              </div>

              <div className="flex items-start">
                <EnvelopeIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{t("Email address")}</h4>
                  <p className="text-gray-600">{email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <ClockIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{t("Business hours")}</h4>
                  <p className="text-gray-600">{t("Monday–Friday: 9:00–18:00")}</p>
                  <p className="text-gray-600">{t("Saturday: 10:00–16:00")}</p>
                  <p className="text-gray-600">{t("Closed Sundays and public holidays")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          {address ? (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-gray-100 rounded-2xl h-[400px] w-full relative overflow-hidden flex items-center justify-center hover:bg-blue-50 transition-colors"
              aria-label={t("View in Google Maps")}
            >
              <div className="text-center">
                <MapPinIcon className="h-12 w-12 text-blue-500 group-hover:text-blue-700 mx-auto mb-2 transition-colors" />
                <span className="text-gray-700 font-semibold">{t("Access map")}</span>
                <p className="text-sm text-gray-500 mt-1">{address}</p>
                <span className="mt-3 inline-block text-xs text-blue-500 underline group-hover:text-blue-700">
                  {t("View in Google Maps →")}
                </span>
              </div>
            </a>
          ) : (
            <div className="bg-gray-200 rounded-2xl h-[400px] w-full relative overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <span className="text-gray-500 font-medium">{t("Access map")}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
