"use client";

import { useMemo } from "react";
import { useEditPostHref } from "../adapter/NewsContext";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import { PAPER_TIMEZONE } from "../core";
import { stateOf, todayPaperDay, type DeskArticle } from "./model";

/**
 * 今後 7 日分の予約記事タイムライン。予約（`scheduled`）と期限切れ（`overdue`）だけを出す。
 *
 * 日ごとに束ねて公開時刻の早い順に並べる。今日より後ろは最大 6 日先まで。
 * 期限切れは今日の束に入れ、赤で示す — 「今日どこかで対処が要る」から。
 *
 * 予約が 1 本も無い日は出さない。7 日分の中に予約が 1 本も無ければ何も出さない
 * （「まだありません」は MetricCards の紙面サマリが持つ）。
 */
export default function ScheduleTimeline({
  articles,
  now,
}: {
  articles: DeskArticle[];
  now: Date;
}) {
  const days = useMemo(() => buildDays(articles, now), [articles, now]);
  if (days.length === 0) return null;

  const today = todayPaperDay(now);

  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: 11,
          letterSpacing: "0.12em",
          color: JB.muted,
          marginBottom: 8,
        }}
      >
        SCHEDULE
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {days.map((day) => (
          <DayRow key={day.day} day={day} today={today} now={now} />
        ))}
      </div>
    </div>
  );
}

function DayRow({
  day,
  today,
  now,
}: {
  day: ScheduleDay;
  today: string;
  now: Date;
}) {
  const editHref = useEditPostHref();
  const isToday = day.day === today;
  return (
    <div style={{ display: "flex", gap: 0 }}>
      {/* 日付ラベル列 */}
      <div
        style={{
          width: 70,
          flexShrink: 0,
          paddingTop: 6,
          fontFamily: FONT_SANS,
          fontSize: 11.5,
          color: isToday ? JB.accent : JB.muted,
          fontWeight: isToday ? 700 : 400,
          letterSpacing: "0.04em",
          lineHeight: 1.4,
        }}
      >
        {isToday ? "今日" : dayShort(day.day)}
      </div>

      {/* 記事の列 */}
      <div
        style={{
          flex: 1,
          borderLeft: `2px solid ${isToday ? JB.accent : JB.line}`,
          paddingLeft: 12,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {day.articles.map((article) => {
          const overdue = stateOf(article, now) === "overdue";
          const href = editHref(article.id);
          return (
            <div
              key={article.id}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "baseline",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 11.5,
                  letterSpacing: "0.02em",
                  color: overdue ? JB.accent : JB.muted,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {timeOnly(article.published_at)}
                {overdue && " ⚠"}
              </span>
              <span
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: 13,
                  color: overdue ? JB.accent : JB.ink,
                  flex: 1,
                  minWidth: 120,
                }}
              >
                {article.title}
              </span>
              {href !== "" && (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 11.5,
                    color: JB.muted,
                    textDecoration: "none",
                    border: `1px solid ${JB.line}`,
                    padding: "1px 7px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  編集
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- helpers ----------------------------------------------------------------

type ScheduleDay = { day: string; articles: DeskArticle[] };

function buildDays(articles: DeskArticle[], now: Date): ScheduleDay[] {
  const today = todayPaperDay(now);
  const cutoff = datePlusDays(today, 7);

  const scheduled = articles.filter((a) => {
    const s = stateOf(a, now);
    return s === "scheduled" || s === "overdue";
  });

  const byDay = new Map<string, DeskArticle[]>();
  for (const article of scheduled) {
    const day = article.published_at ? isoToDay(article.published_at) : today;
    if (day >= today && day < cutoff) {
      const list = byDay.get(day);
      if (list) list.push(article);
      else byDay.set(day, [article]);
    }
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, arts]) => ({
      day,
      articles: arts.sort((a, b) => timeMs(a.published_at) - timeMs(b.published_at)),
    }));
}

function isoToDay(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: PAPER_TIMEZONE,
  })
    .format(new Date(iso))
    .replace(/\//g, "-");
}

function datePlusDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00+09:00`);
  d.setDate(d.getDate() + n);
  return isoToDay(d.toISOString());
}

function timeMs(iso: string | null): number {
  return iso ? new Date(iso).getTime() || 0 : 0;
}

function timeOnly(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: PAPER_TIMEZONE,
  }).format(new Date(iso));
}

function dayShort(day: string): string {
  const [, m, d] = day.split("-");
  return `${Number(m)}/${Number(d)}`;
}
