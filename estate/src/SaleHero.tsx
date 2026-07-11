import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import { ESTATE_EVENTS } from "./types";
import SaleInquiry from "./SaleInquiry";

export interface SaleHeroProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  /**
   * CTA behaviour. `true` (default) = SaleHero opens its OWN assessment dialog
   * (self-contained — a single widget works, no wiring needed). `false` = only
   * broadcast `ctaEvent` so a separate SaleInquiry (asDialog) opens.
   */
  openInDialog?: boolean;
  /** Event emitted on CTA click (used when openInDialog is false). */
  ctaEvent?: string;
  /** Passed to the built-in assessment dialog. */
  inquiryTitle?: string;
  inquiryDescription?: string;
  inquirySubmitLabel?: string;
  /** Endpoint the built-in assessment form POSTs to. */
  endpoint?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  onCtaClick?: () => void;
  __stackpage?: StackPageRuntimeApi;
}

const SaleHero: React.FC<SaleHeroProps> = ({
  title = "Sell Your Home for the Best Price",
  subtitle = "Expert valuation, marketing strategies, and support to get you the best deal.",
  backgroundImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  ctaText = "Get Free Assessment",
  openInDialog = true,
  ctaEvent = ESTATE_EVENTS.saleAssessmentOpen,
  inquiryTitle,
  inquiryDescription,
  inquirySubmitLabel,
  endpoint = "/api/estate/inquiries",
  backgroundColor,
  fontSize,
  className = "",
  style,
  onCtaClick,
  __stackpage,
}) => {
  const t = useT();
  const [open, setOpen] = useState(false);

  const mergedStyle: React.CSSProperties = {
    backgroundColor,
    fontSize,
    ...style,
  };

  const handleCta = () => {
    if (openInDialog) {
      // Self-contained: open our own SaleInquiry dialog.
      setOpen(true);
    } else if (__stackpage?.emit && ctaEvent) {
      // Event mode: a separate SaleInquiry (asDialog) listens and opens.
      __stackpage.emit(ctaEvent, { source: "sale-hero" });
    }
    onCtaClick?.();
  };

  return (
    <div
      className={`relative w-full h-full min-h-[400px] flex items-center justify-center text-center text-white ${className}`}
      style={mergedStyle}
    >
      {/* Background Image with darker overlay for readability */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          {t(title)}
        </h1>
        <p className="text-xl md:text-2xl opacity-90 font-light max-w-2xl mx-auto">
          {t(subtitle)}
        </p>

        <div className="pt-8">
          <button
            onClick={handleCta}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {t(ctaText)}
          </button>
        </div>
      </div>

      {/* Built-in assessment dialog (self-contained mode) */}
      {openInDialog &&
        open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-black/50 p-4 overflow-y-auto text-left text-gray-900"
            onClick={() => setOpen(false)}
            role="presentation"
          >
            <div
              className="w-full max-w-4xl my-8"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <SaleInquiry
                title={inquiryTitle}
                description={inquiryDescription}
                submitLabel={inquirySubmitLabel}
                endpoint={endpoint}
                onClose={() => setOpen(false)}
                __stackpage={__stackpage}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default SaleHero;
