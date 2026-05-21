import React from "react";
import { PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { useT } from "./hooks/useTranslation";

export interface AgentCardProps {
  name?: string;
  title?: string;
  image?: string;
  phone?: string;
  email?: string;
  bio?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
}

const AgentCard: React.FC<AgentCardProps> = ({
  name = "Sarah Johnson",
  title = "Senior Real Estate Agent",
  image = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  phone = "+1 (555) 123-4567",
  email = "sarah@example.com",
  bio = "Specializing in luxury properties with over 10 years of experience in the local market.",
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
      className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row w-full h-full ${className}`}
      style={mergedStyle}
    >
      <div className="relative h-[40%] min-h-[250px] md:h-full md:w-2/5 shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover absolute inset-0 md:relative"
        />
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover absolute inset-0"
        />
      </div>
      <div className="p-8 md:w-3/5 flex flex-col justify-center flex-grow">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-blue-600 font-medium mb-4">{t(title)}</p>
        <p className="text-gray-600 mb-6 leading-relaxed">{t(bio)}</p>

        <div className="space-y-3 mt-auto">
          <div className="flex items-center text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
            <PhoneIcon className="h-5 w-5 mr-3" />
            <span className="font-medium">{phone}</span>
          </div>
          <div className="flex items-center text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
            <EnvelopeIcon className="h-5 w-5 mr-3" />
            <span className="font-medium">{email}</span>
          </div>
        </div>

        <button className="mt-8 w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
          {t("Contact Agent")}
        </button>
      </div>
    </div>
  );
};

export default AgentCard;
