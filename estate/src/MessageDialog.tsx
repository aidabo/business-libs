import React from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useT } from "./hooks/useTranslation";

export interface MessageDialogProps {
  open: boolean;
  /** Heading text (translated via useT). */
  title?: string;
  /** Body message (translated via useT). */
  message: string;
  /** Close button label (translated via useT). */
  closeLabel?: string;
  onClose: () => void;
}

/**
 * Small centered notice dialog (Portal → document.body, high z-index) matching the
 * AgentCard modal style. Used e.g. when a card click can't open a detail page
 * because the property has no linked Post yet.
 */
const MessageDialog: React.FC<MessageDialogProps> = ({
  open,
  title,
  message,
  closeLabel = "閉じる",
  onClose,
}) => {
  const t = useT();

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h4 className="text-base font-bold text-gray-900">
            {t(title || "お知らせ")}
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label={t(closeLabel)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-6">
          <p className="text-sm leading-6 text-gray-600">{t(message)}</p>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded-lg"
          >
            {t(closeLabel)}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MessageDialog;
