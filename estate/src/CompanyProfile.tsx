import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";

export interface CompanyHistoryEntry {
  year: string;
  month?: string;
  event: string;
}

export interface CompanyProfileProps {
  title?: string;
  description?: string;
  presidentName?: string;
  presidentTitle?: string;
  presidentImage?: string;
  presidentMessage?: string;
  companyName?: string;
  address?: string;
  phone?: string;
  fax?: string;
  email?: string;
  representative?: string;
  establishmentDate?: string;
  capital?: string;
  businessDescription?: string;
  license?: string;
  employees?: string;
  mapUrl?: string;
  mapEmbedUrl?: string;
  history?: CompanyHistoryEntry[];
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({
  title = "会社案内",
  description = "当社についてご紹介いたします。",
  presidentName = "代表取締役 山田 太郎",
  presidentTitle = "代表取締役社長",
  presidentImage,
  presidentMessage = "私たちは、お客様一人ひとりの理想の住まい探しをサポートします。不動産取引における透明性と誠実さを何より大切にし、専門知識と豊富な経験を活かして、最適な物件選びから購入後のアフターサービスまで一貫したサポートを提供いたします。\n\n地域に密着した不動産会社として、お客様の人生の大切な決断を全力でサポートしてまいります。",
  companyName = "株式会社Think Estate",
  address = "〒123-4567 東京都世田谷区xxx町1-2-3",
  phone = "03-1234-5678",
  fax = "03-1234-5679",
  email = "info@thinkestate-jp.com",
  representative = "山田 太郎",
  establishmentDate = "2010年4月",
  capital = "1,000万円",
  businessDescription = "不動産売買・賃貸仲介、不動産管理、不動産コンサルティング",
  license = "東京都知事 (1) 第12345号",
  employees = "15名（2024年4月現在）",
  mapEmbedUrl,
  history,
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage: _stackpage,
}) => {
  const t = useT();

  const mergedStyle: React.CSSProperties = {
    backgroundColor,
    fontSize,
    ...style,
  };

  const companyInfoRows: [string, string][] = [
    [t("Company Name"), companyName],
    [t("Address"), address],
    [t("Phone"), phone],
    ...(fax ? [[t("Fax"), fax] as [string, string]] : []),
    [t("Email"), email],
    [t("Representative"), representative],
    [t("Established"), establishmentDate],
    [t("Capital"), capital],
    [t("Business Description"), businessDescription],
    ...(license ? [[t("License"), license] as [string, string]] : []),
    ...(employees ? [[t("Employees"), employees] as [string, string]] : []),
  ];

  return (
    <section className={`py-16 ${className}`} style={mergedStyle}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t(title)}
          </h2>
          {description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t(description)}
            </p>
          )}
        </div>

        {/* President Message */}
        {presidentMessage && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {t("President's Message")}
            </h3>
            <div className="flex flex-col md:flex-row gap-8 items-start max-w-4xl mx-auto">
              {presidentImage && (
                <div className="w-full md:w-72 shrink-0">
                  <img
                    src={presidentImage}
                    alt={presidentName}
                    className="w-full h-80 object-cover rounded-xl shadow-md"
                  />
                  <div className="mt-3 text-center">
                    <p className="text-sm font-bold text-gray-900">{presidentTitle}</p>
                    <p className="text-lg font-semibold text-gray-700">{presidentName}</p>
                  </div>
                </div>
              )}
              <div className="flex-grow">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  {presidentMessage.split("\n").map((paragraph, i) => (
                    <p
                      key={i}
                      className={`text-gray-700 leading-relaxed ${i > 0 ? "mt-4" : ""}`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                {!presidentImage && (
                  <div className="mt-4 text-right">
                    <p className="text-sm font-bold text-gray-900">{presidentTitle}</p>
                    <p className="text-base font-semibold text-gray-700">{presidentName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Company Overview */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {t("Company Overview")}
          </h3>
          <div className="max-w-3xl mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <tbody>
                {companyInfoRows.map(([label, value], i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <th className="px-6 py-4 text-left text-gray-600 font-medium whitespace-nowrap w-48 border-r border-gray-100">
                      {label}
                    </th>
                    <td className="px-6 py-4 text-gray-900">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* History */}
        {history && history.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {t("Company History")}
            </h3>
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 md:-translate-x-px" />
                {history.map((entry, i) => (
                  <div
                    key={i}
                    className={`relative flex flex-col md:flex-row gap-4 md:gap-8 pb-8 ${
                      i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className="hidden md:block md:w-1/2" />
                    <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow -translate-x-1/2 mt-1.5" />
                    <div className="ml-10 md:ml-0 md:w-1/2">
                      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <span className="inline-block bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded mb-2">
                          {entry.year}
                          {entry.month ? `.${entry.month}` : ""}
                        </span>
                        <p className="text-sm text-gray-700">{t(entry.event)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Access / Map */}
        {mapEmbedUrl && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {t("Access")}
            </h3>
            <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="aspect-video w-full">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={t("Office Map")}
                />
              </div>
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{companyName}</span>
                  <br />
                  {address}
                  <br />
                  {t("Phone")}: {phone}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CompanyProfile;
