import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface ApplicationStep {
  step: number;
  label: string;
  description?: string;
}

export interface ApplicationGuideProps {
  title?: string;
  procedureName?: string;
  description?: string;
  steps?: ApplicationStep[];
  requiredDocuments?: string[];
  office?: string;
  hours?: string;
  phone?: string;
  linkUrl?: string;
  linkLabel?: string;
  fee?: string;
  processingTime?: string;
  __stackpage?: StackPageRuntimeApi;
}

const ApplicationGuide: React.FC<ApplicationGuideProps> = ({
  title,
  procedureName,
  description,
  steps = [],
  requiredDocuments = [],
  office,
  hours,
  phone,
  linkUrl,
  linkLabel = 'Apply Online',
  fee,
  processingTime,
}) => {
  return (
    <div className="rounded-lg border border-emerald-200 bg-white p-3 sm:p-4 md:p-5">
      {title && <h3 className="mb-3 text-base font-bold text-gray-900 md:text-lg">{title}</h3>}
      {procedureName && (
        <h4 className="mb-1 text-xl font-semibold text-emerald-800">{procedureName}</h4>
      )}
      {description && <p className="mb-4 text-sm leading-relaxed text-gray-600">{description}</p>}

      {/* Fee / Processing Time */}
      {(fee || processingTime) && (
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          {fee && (
            <span className="rounded bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
              Fee: {fee}
            </span>
          )}
          {processingTime && (
            <span className="rounded bg-blue-50 px-3 py-1 font-medium text-blue-700">
              Processing: {processingTime}
            </span>
          )}
        </div>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <div className="mb-4">
          <h5 className="mb-2 text-sm font-semibold text-gray-700">Procedure Steps</h5>
          <div className="space-y-2">
            {steps.map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  {s.step}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.label}</p>
                  {s.description && (
                    <p className="text-xs text-gray-500">{s.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Required Documents */}
      {requiredDocuments.length > 0 && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3">
          <h5 className="mb-1 text-sm font-semibold text-amber-800">
            Required Documents ({requiredDocuments.length})
          </h5>
          <ul className="list-inside list-disc space-y-0.5 text-sm text-gray-700">
            {requiredDocuments.map((doc, i) => (
              <li key={i}>{doc}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Contact */}
      {(office || hours || phone) && (
        <div className="mb-4 border-t border-gray-100 pt-3 text-sm text-gray-600">
          {office && <p><span className="font-medium">Office:</span> {office}</p>}
          {hours && <p><span className="font-medium">Hours:</span> {hours}</p>}
          {phone && <p><span className="font-medium">Contact:</span> {phone}</p>}
        </div>
      )}

      {linkUrl && (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          {linkLabel}
        </a>
      )}
    </div>
  );
};

export default ApplicationGuide;
