"use client";

import { useEffect, useMemo, useState } from "react";

type PersonStoryTimelineHtmlBlockProps = {
  referenceId?: string;
  query?: string;
  timelineHtml?: string;
  timelineHtmlPath?: string;
  compact?: boolean;
};

type TimelinePayload = {
  timelineHtml?: string;
  timelineHtmlPath?: string;
  galleryManifest?: {
    slug?: string;
    gallery_path?: string;
    source_path?: string;
  } | null;
  story?: {
    slug?: string;
    title?: string;
    subject?: string;
    timelineHtmlPath?: string;
  };
};

export default function PersonStoryTimelineHtmlBlock({
  referenceId = "yamada-sakura",
  query = "",
  timelineHtml = "",
  timelineHtmlPath = "",
  compact = false,
}: PersonStoryTimelineHtmlBlockProps) {
  const slug = useMemo(() => {
    const trimmedQuery = String(query || "").trim();
    return String(referenceId || trimmedQuery || "yamada-sakura").trim();
  }, [query, referenceId]);

  const [html, setHtml] = useState(timelineHtml);
  const [resolvedPath, setResolvedPath] = useState(timelineHtmlPath);
  const [title, setTitle] = useState(slug);
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState<string>("loading");

  useEffect(() => {
    if (timelineHtml) {
      setHtml(timelineHtml);
      setResolvedPath(timelineHtmlPath || "");
      setStatus("ready");
      return;
    }

    let active = true;
    setStatus("loading");
    fetch(`/api/person/stories/${encodeURIComponent(slug)}/timeline`, {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load timeline (${response.status})`);
        }
        return (await response.json()) as TimelinePayload;
      })
      .then((payload) => {
        if (!active) return;
        setHtml(String(payload.timelineHtml || ""));
        setResolvedPath(String(payload.timelineHtmlPath || payload.story?.timelineHtmlPath || ""));
        setTitle(String(payload.story?.title || payload.galleryManifest?.slug || slug));
        setSubject(String(payload.story?.subject || payload.galleryManifest?.slug || ""));
        setStatus("ready");
      })
      .catch((error: any) => {
        if (!active) return;
        setHtml(
          `<!doctype html><html><body><p>Timeline HTML not available for ${slug}: ${String(
            error?.message || "unknown error",
          )}</p></body></html>`,
        );
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [slug, timelineHtml, timelineHtmlPath]);

  return (
    <section className={`rounded-2xl border border-amber-100 bg-white p-4 shadow-sm ${compact ? "max-w-5xl" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            Timeline HTML block
          </p>
          <h3 className="mt-1 text-lg font-bold text-gray-900">{title}</h3>
          {subject ? <p className="mt-1 text-sm text-gray-600">{subject}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/person-stories/${encodeURIComponent(slug)}/timeline`}
            className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"
          >
            Open timeline page
          </a>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {status}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-xs text-gray-700">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-gray-900">timelineHtmlPath</span>
          <code className="rounded bg-white px-2 py-1 ring-1 ring-amber-100">
            {resolvedPath || timelineHtmlPath || "not provided"}
          </code>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-gray-500">
          This block renders the raw timeline HTML from the registry/API payload. Use it when you want the
          actual timeline document, not just the outline preview.
        </p>
      </div>

      <section className="mt-4 overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
        {html ? (
          <iframe
            title={`${title} timeline html`}
            srcDoc={html}
            className="min-h-[900px] w-full border-0"
            loading="lazy"
          />
        ) : (
          <div className="flex min-h-[280px] items-center justify-center text-sm text-gray-500">
            Loading timeline HTML...
          </div>
        )}
      </section>
    </section>
  );
}
