import React, { useState } from 'react';
import type { StackPageRuntimeApi } from './types';

export interface EmergencyAlertProps {
  alerts?: Array<{
    id: string;
    title: string;
    description?: string;
    severity: 'warning' | 'critical' | 'advisory';
    issuedAt: string;
    expiresAt?: string;
    issuedBy?: string;
    linkUrl?: string;
    linkLabel?: string;
  }>;
  dismissible?: boolean;
  maxAlerts?: number;
  __stackpage?: StackPageRuntimeApi;
}

const SEVERITY_STYLES = {
  critical: {
    bg: 'bg-red-50 border-red-400',
    badge: 'bg-red-600 text-white',
    icon: 'text-red-600',
    label: 'CRITICAL',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-400',
    badge: 'bg-amber-600 text-white',
    icon: 'text-amber-600',
    label: 'WARNING',
  },
  advisory: {
    bg: 'bg-blue-50 border-blue-400',
    badge: 'bg-blue-600 text-white',
    icon: 'text-blue-600',
    label: 'ADVISORY',
  },
};

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({
  alerts = [],
  dismissible = true,
  maxAlerts = 3,
}) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = alerts
    .filter(a => !dismissed.has(a.id))
    .slice(0, maxAlerts);

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map(alert => {
        const style = SEVERITY_STYLES[alert.severity];
        return (
          <div
            key={alert.id}
            className={`relative rounded-lg border-2 ${style.bg} p-4`}
          >
            <div className="flex items-start gap-3">
              {alert.severity === 'critical' ? (
                <svg className={`h-6 w-6 shrink-0 ${style.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.068 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (
                <svg className={`h-6 w-6 shrink-0 ${style.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${style.badge}`}>
                    {style.label}
                  </span>
                  <span className="text-xs font-medium text-gray-700">{alert.title}</span>
                </div>
                {alert.description && (
                  <p className="mt-1 text-sm text-gray-600">{alert.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span>Issued: {alert.issuedAt}</span>
                  {alert.expiresAt && <span>Expires: {alert.expiresAt}</span>}
                  {alert.issuedBy && <span>Source: {alert.issuedBy}</span>}
                </div>
                {alert.linkUrl && (
                  <a
                    href={alert.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-semibold text-blue-700 hover:underline"
                  >
                    {alert.linkLabel || 'Learn More'} →
                  </a>
                )}
              </div>
              {dismissible && (
                <button
                  onClick={() => setDismissed(prev => new Set(prev).add(alert.id))}
                  className="shrink-0 rounded p-1 text-gray-400 hover:bg-white/50 hover:text-gray-600"
                  aria-label="Dismiss"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EmergencyAlert;
