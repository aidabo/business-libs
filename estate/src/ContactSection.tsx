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
  companyName = "Estate Realty Group",
  address = "123 Business Blvd, Suite 100, City, ST 12345",
  phone = "+1 (800) 123-4567",
  email = "contact@estate-realty.com",
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("Get in Touch")}</h2>
            <p className="text-lg text-gray-600 mb-8">
              {t("Whether you're looking to buy, sell, or rent, our team is here to help you every step of the way. Visit our office or contact us today.")}
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <MapPinIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{t("Office Address")}</h4>
                  <p className="text-gray-600">{companyName}</p>
                  <p className="text-gray-600">{address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <PhoneIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{t("Phone")}</h4>
                  <p className="text-gray-600">{phone}</p>
                  <p className="text-sm text-gray-500">{t("Mon-Fri 9am to 6pm")}</p>
                </div>
              </div>

              <div className="flex items-start">
                <EnvelopeIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{t("Email")}</h4>
                  <p className="text-gray-600">{email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <ClockIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{t("Operating Hours")}</h4>
                  <p className="text-gray-600">{t("Monday - Friday: 9:00 AM - 6:00 PM")}</p>
                  <p className="text-gray-600">{t("Saturday: 10:00 AM - 4:00 PM")}</p>
                  <p className="text-gray-600">{t("Sunday: Closed")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-gray-200 rounded-2xl h-[400px] w-full relative overflow-hidden flex items-center justify-center">
            {/* Ideally utilize an iframe map here or a static map image */}
            <div className="text-center">
              <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <span className="text-gray-500 font-medium">{t("Map Location")}</span>
              <p className="text-sm text-gray-400 mt-1">{address}</p>
            </div>
            {/* Example iframe implementation (commented out to avoid external calls)
            <iframe 
               src="https://www.google.com/maps/embed?..." 
               className="absolute inset-0 w-full h-full border-0" 
               allowFullScreen 
               loading="lazy" 
            /> 
            */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
