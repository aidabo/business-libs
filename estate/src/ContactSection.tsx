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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("お問い合わせ")}</h2>
            <p className="text-lg text-gray-600 mb-8">
              {t("不動産の売買・賃貸に関するご質問やご相談がございましたら、お気軽にお問い合わせください。経験豊富なスタッフが丁寧に対応いたします。")}
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <MapPinIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{t("所在地")}</h4>
                  <p className="text-gray-600">{companyName}</p>
                  <p className="text-gray-600">{address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <PhoneIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{t("電話番号")}</h4>
                  <p className="text-gray-600">{phone}</p>
                  <p className="text-sm text-gray-500">{t("月〜金 9:00〜18:00")}</p>
                </div>
              </div>

              <div className="flex items-start">
                <EnvelopeIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{t("メールアドレス")}</h4>
                  <p className="text-gray-600">{email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <ClockIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{t("営業時間")}</h4>
                  <p className="text-gray-600">{t("月曜日〜金曜日: 9:00〜18:00")}</p>
                  <p className="text-gray-600">{t("土曜日: 10:00〜16:00")}</p>
                  <p className="text-gray-600">{t("日曜日・祝日: 定休日")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-gray-200 rounded-2xl h-[400px] w-full relative overflow-hidden flex items-center justify-center">
            <div className="text-center">
              <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <span className="text-gray-500 font-medium">{t("アクセスマップ")}</span>
              <p className="text-sm text-gray-400 mt-1">{address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
