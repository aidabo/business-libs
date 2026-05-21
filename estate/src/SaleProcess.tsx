import React from "react";
import { ClipboardDocumentCheckIcon, ChartBarIcon, CurrencyDollarIcon, HomeModernIcon } from "@heroicons/react/24/outline";
import { useT } from "./hooks/useTranslation";
import SaleInquiry from "./SaleInquiry";
import PropertyCard from "./PropertyCard";
import AgentCard from "./AgentCard";
import ContactSection from "./ContactSection";

export interface SaleProcessProps {
  title?: string;
  subtitle?: string;
  steps?: { title: string; description: string; icon?: React.ReactNode; visual?: React.ReactNode }[];
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SaleProcess: React.FC<SaleProcessProps> = ({
  title = "How It Works",
  subtitle = "Our simple 4-step process to sell your home.",
  steps,
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

  const defaultSteps = [
    {
      title: t("Consultation & Assessment"),
      description: t("We visit your property to understand its value and unique appeal. Receive a free, accurate market valuation report based on local data."),
      icon: <HomeModernIcon className="w-10 h-10 text-blue-600" />,
      visual: (
        <div className="scale-75 origin-top transform -mb-10">
          <SaleInquiry
            title={t("Free Valuation")}
            description={t("Get started with a quick assessment.")}
          />
        </div>
      ),
    },
    {
      title: t("Listing & Marketing"),
      description: t("We sign a brokerage agreement and list your property on major platforms like REINS. We use professional photography to attract buyers."),
      icon: <ClipboardDocumentCheckIcon className="w-10 h-10 text-blue-600" />,
      visual: (
        <div className="scale-75 origin-top transform">
          <PropertyCard
            image="https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            price="$850,000"
            address={t("1-2-3 Roppongi, Minato-ku, Tokyo")}
            beds={3}
            tag={t("JUST LISTED")}
          />
        </div>
      ),
    },
    {
      title: t("Viewings & Negotiation"),
      description: t("Our experienced agents host viewings and manage negotiations with potential buyers to ensure you get the best possible price and terms."),
      icon: <ChartBarIcon className="w-10 h-10 text-blue-600" />,
      visual: (
        <div className="scale-75 origin-top transform">
          <AgentCard
            name={t("Kenji Tanaka")}
            title={t("Sales Specialist")}
            bio={t("Expert in residential sales.")}
          />
        </div>
      ),
    },
    {
      title: t("Contract & Handover"),
      description: t("We handle all legal paperwork, including the sales contract and settlement. We guide you through the final handover to the new owner."),
      icon: <CurrencyDollarIcon className="w-10 h-10 text-blue-600" />,
      visual: (
        <div className="scale-75 origin-top transform -mb-20">
          <ContactSection
            companyName={t("Estate Legal Dept")}
            address={t("Support for closing")}
            phone=""
            email=""
          />
        </div>
      ), // Using ContactSection as a placeholder for "Support/Closing", simplified
    },
  ];

  const displaySteps = steps || defaultSteps;

  return (
    <section className={`py-16 bg-white ${className}`} style={mergedStyle}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t(title)}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t(subtitle)}</p>
        </div>

        <div className="space-y-24">
          {displaySteps.map((step, index) => (
            <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              {/* Text Side */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center lg:justify-start gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-bold">
                    {index + 1}
                  </span>
                  {step.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  {step.description}
                </p>
              </div>

              {/* Visual Side (Component Preview) */}
              <div className="flex-1 w-full max-w-md bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-inner flex items-center justify-center overflow-hidden min-h-[300px]">
                {step.visual || <div className="text-gray-400 italic">{t("No preview available")}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SaleProcess;
