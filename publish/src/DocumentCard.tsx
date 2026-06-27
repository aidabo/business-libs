import React from 'react';

export interface DocumentCardProps {
  title: string;
  issuingAuthority: string;
  documentDate: string;
  documentType: string;
  fileSize?: string;
  description?: string;
  urgent?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  issuingAuthority,
  documentDate,
  documentType,
  fileSize,
  description,
  urgent = false,
}) => {
  return (
    <div className={`rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm ${
      urgent ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-emerald-500'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`mt-1 shrink-0 rounded p-2 ${urgent ? 'bg-red-100' : 'bg-emerald-100'}`}>
          <svg className={`h-5 w-5 ${urgent ? 'text-red-600' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 md:text-base">{title}</h3>
              <p className="mt-0.5 text-xs text-gray-500 md:text-sm">{issuingAuthority}</p>
            </div>
            {urgent && (
              <span className="shrink-0 rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                URGENT
              </span>
            )}
          </div>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {documentDate}
            </span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5">{documentType}</span>
            {fileSize && <span>{fileSize}</span>}
            <span className="ml-auto font-medium text-emerald-600 hover:underline cursor-pointer">
              Download
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
