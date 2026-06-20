import PortalAnnouncements from "./PortalAnnouncements";
import PortalAppLinks from "./PortalAppLinks";
import PortalFileLibrary from "./PortalFileLibrary";
import PortalContactForm from "./PortalContactForm";
import PortalSupportForm from "./PortalSupportForm";
import PortalEmailForm from "./PortalEmailForm";
import { PortalProvider } from "./contexts/PortalContext";

export const PortalComponents = {
  PortalAnnouncements,
  PortalAppLinks,
  PortalFileLibrary,
  PortalContactForm,
  PortalSupportForm,
  PortalEmailForm,
  PortalProvider,
};

export const PortalDefaultProps = {
  PortalAnnouncements: {
    title: "最新のお知らせ",
    maxItems: 10,
    showSummary: true,
    moreLabel: "もっと見る",
    moreUrl: "/portal/news",
    _componentDesc: "Latest announcements feed with title, date, and summary",
    items: [
      {
        title: "全社朝会のお知らせ",
        date: "2026-02-10",
        summary: "来週月曜 9:00 より全社朝会を実施します。",
        link: "/portal/news/1",
      },
      {
        title: "経営陣メッセージ",
        date: "2026-02-08",
        summary: "今期方針と重点施策を公開しました。",
        link: "/portal/news/2",
      },
    ],
  },
  PortalAppLinks: {
    title: "リンク集",
    columns: 2,
    _componentDesc: "Grid of portal links with optional descriptions",
    links: [
      { label: "Wadaxメール", url: "https://example.com/mail", description: "メールシステム" },
      { label: "LineWorks", url: "https://example.com/lineworks", description: "社内チャット" },
    ],
  },
  PortalFileLibrary: {
    title: "マニュアル・規定集",
    sectionType: "manuals",
    _componentDesc: "Downloadable file library for manuals, templates, or general files",
    files: [
      { title: "就業規則", fileUrl: "/files/work-rule.pdf", category: "rule" },
      { title: "組織図", fileUrl: "/files/org-chart.pdf", category: "org" },
    ],
    __schemaOptions: {
      sectionType: { options: ["manuals", "templates", "files"] },
    },
  },
  PortalContactForm: {
    title: "お問い合わせ",
    submitLabel: "送信",
    endpoint: "/api/portal/contact",
    recipient: "support@example.com",
    _componentDesc: "Contact form for portal inquiries",
  },
  PortalSupportForm: {
    title: "サポート依頼",
    endpoint: "/api/portal/support",
    priorityOptions: ["low", "normal", "high"],
    _componentDesc: "Support request form with priority selection",
  },
  PortalEmailForm: {
    title: "メール送信",
    endpoint: "/api/portal/send-email",
    to: "",
    cc: "",
    _componentDesc: "Email sending form for portal workflows",
  },
};

export {
  PortalAnnouncements,
  PortalAppLinks,
  PortalFileLibrary,
  PortalContactForm,
  PortalSupportForm,
  PortalEmailForm,
  PortalProvider,
};
