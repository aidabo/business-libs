import React from "react";
import { useT } from "./hooks/useTranslation";

export interface FileItem {
  title: string;
  fileUrl: string;
  category?: string;
}

export interface PortalFileLibraryProps {
  title?: string;
  sectionType?: "manuals" | "templates" | "files";
  files?: FileItem[];
  className?: string;
  style?: React.CSSProperties;
}

const PortalFileLibrary: React.FC<PortalFileLibraryProps> = ({
  title,
  sectionType = "files",
  files = [],
  className = "",
  style,
}) => {
  const t = useT();

  const resolvedTitle =
    title ||
    (sectionType === "manuals"
      ? t("Manuals and Regulations")
      : sectionType === "templates"
        ? t("Document Templates")
        : t("File Downloads"));

  return (
    <section className={`rounded-xl border border-gray-200 bg-white p-5 ${className}`} style={style}>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{resolvedTitle}</h2>
      <ul className="space-y-2">
        {files.map((item, index) => (
          <li key={`${item.title}-${index}`}>
            <a
              href={item.fileUrl}
              download
              className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
            >
              <span>{item.title}</span>
              <span className="text-xs text-blue-600">{t("Download")}</span>
            </a>
          </li>
        ))}
      </ul>
      {files.length === 0 && <p className="text-sm text-gray-500">{t("No files available.")}</p>}
    </section>
  );
};

export default PortalFileLibrary;
