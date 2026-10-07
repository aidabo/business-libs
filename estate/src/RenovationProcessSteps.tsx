import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";

interface ProcessStep {
  stepNumber?: number;
  title: string;
  description?: string;
  icon?: string;
}

export interface RenovationProcessStepsProps {
  title?: string;
  description?: string;
  steps?: ProcessStep[];
  layout?: "horizontal" | "vertical";
  accentColor?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  _componentDesc?: string;
  __schema?: Record<string, unknown>;
  __stackpage?: StackPageRuntimeApi;
}

const DEFAULT_STEPS: ProcessStep[] = [
  { stepNumber: 1, title: "無料相談", description: "まずはお気軽にご相談ください。ご要望・ご予算をヒアリングします。", icon: "💬" },
  { stepNumber: 2, title: "現地調査", description: "専門スタッフが現地を調査し、最適なプランをご提案します。", icon: "🔍" },
  { stepNumber: 3, title: "お見積り", description: "詳細な工事内容と費用をご提示します。納得いただくまでご相談可能です。", icon: "📋" },
  { stepNumber: 4, title: "ご契約", description: "工事内容・費用・工期を確認のうえ、ご契約いただきます。", icon: "✍️" },
  { stepNumber: 5, title: "施工", description: "経験豊富な職人が丁寧に施工いたします。進捗はその都度ご報告します。", icon: "🔨" },
  { stepNumber: 6, title: "完成・引渡し", description: "仕上がりを確認いただき、保証書をお渡しします。", icon: "🏠" },
];

const RenovationProcessSteps: React.FC<RenovationProcessStepsProps> = ({
  title = "リフォームの流れ",
  description = "ご相談から完成・引渡しまで、安心してお任せいただけるステップでご案内します。",
  steps,
  layout = "horizontal",
  accentColor = "#2563eb",
  backgroundColor,
  fontSize,
  className = "",
  style,
}) => {
  const t = useT();
  const mergedStyle: React.CSSProperties = { backgroundColor, fontSize, ...style };
  const displaySteps = steps ?? DEFAULT_STEPS;
  const isVertical = layout === "vertical";

  return (
    <section className={`w-full ${className}`} style={mergedStyle}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="mb-10 text-center">
            {title && (
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {t(title)}
              </h2>
            )}
            {description && (
              <p className="mt-3 text-sm text-slate-500">{t(description)}</p>
            )}
          </div>
        )}

        {isVertical ? (
          <ol className="mx-auto max-w-2xl space-y-4">
            {displaySteps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {step.stepNumber ?? i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    {step.icon && <span className="text-xl">{step.icon}</span>}
                    <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                  </div>
                  {step.description && (
                    <p className="text-sm leading-6 text-slate-500">{step.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
            {displaySteps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white shadow-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  {step.stepNumber ?? i + 1}
                </span>
                {step.icon && <span className="mt-3 text-2xl">{step.icon}</span>}
                <h3 className="mt-2 text-sm font-bold leading-snug text-slate-900">{step.title}</h3>
                {step.description && (
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">{step.description}</p>
                )}
                {i < displaySteps.length - 1 && (
                  <svg
                    className="absolute -right-2 top-5 hidden h-5 w-5 text-slate-300 lg:block"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

RenovationProcessSteps.displayName = "RenovationProcessSteps";
export default RenovationProcessSteps;
