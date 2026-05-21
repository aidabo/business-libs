import React from "react";
import { useT } from "./hooks/useTranslation";

export interface AppLinkItem {
  label: string;
  url: string;
  description?: string;
  openInNewTab?: boolean;
}

export interface PortalAppLinksProps {
  title?: string;
  links?: AppLinkItem[];
  columns?: number;
  className?: string;
  style?: React.CSSProperties;
}

const PortalAppLinks: React.FC<PortalAppLinksProps> = ({
  title,
  links = [],
  columns = 2,
  className = "",
  style,
}) => {
  const t = useT();
  const gridColumns = Math.min(Math.max(columns, 1), 4);

  return (
    <section className={`rounded-xl border border-gray-200 bg-white p-5 ${className}`} style={style}>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title || t("App Links")}</h2>
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
        }}
      >
        {links.map((item, index) => (
          <a
            key={`${item.label}-${index}`}
            href={item.url}
            target={item.openInNewTab === false ? "_self" : "_blank"}
            rel="noreferrer"
            className="rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-300 hover:bg-blue-50"
          >
            <div className="text-sm font-medium text-gray-900">{item.label}</div>
            {item.description && <div className="text-xs text-gray-600">{item.description}</div>}
          </a>
        ))}
      </div>
      {links.length === 0 && <p className="text-sm text-gray-500">{t("No links configured.")}</p>}
    </section>
  );
};

export default PortalAppLinks;
