"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { FONT_SANS, JB } from "../core";
import {
  WEEKDAY_LABELS,
  countByPaperDay,
  dayLabel,
  inMonth,
  monthGrid,
  monthLabel,
  monthOf,
  stepDay,
  stepMonth,
  todayPaperDay,
  type DeskArticle,
  type MonthRef,
} from "./model";

/**
 * 日の口（日付 + ◀ ▶ + カレンダーのポップアップ）。
 *
 * もとはグローバルフィルタバー（Console.tsx）の中に直接書いてあった。電子紙面タブでは
 * バーを出さないことになり（ユーザー指示 2026-10-11）、**同じ口をタブの中にも出す**ために
 * ここへ 1 本として切り出した — バーの中と電子紙面タブで、見た目も操作も同じ 1 本であること
 * （2 つ書くと、片方だけ直したときに日付の動かし方が食い違う）。
 *
 * 選んだ日（`pickedDay`）は親が持つ。口が 2 か所に増えても**持ち主は増やさない** —
 * タブを行き来しても日は変わらない。
 */
export default function DayPicker({
  pickedDay,
  onPickDay,
  articles,
  now,
}: {
  pickedDay: string | null;
  onPickDay: (day: string | null) => void;
  /** 月の升目に出す件数の元（紙面日ごとの記事数）。読めていない間は空で渡す。 */
  articles: DeskArticle[];
  now: Date;
}) {
  const [calOpen, setCalOpen] = useState(false);
  const today = todayPaperDay(now);
  const initMonth = (): MonthRef => monthOf(today) ?? { year: now.getFullYear(), month: now.getMonth() + 1 };
  const [calMonth, setCalMonth] = useState<MonthRef>(initMonth);

  const openCalendar = () => {
    const m = pickedDay ? monthOf(pickedDay) : monthOf(today);
    setCalMonth(m ?? initMonth());
    setCalOpen(true);
  };

  // 前後の日へ動かす。「すべて」（pickedDay = null）のときは今日を起点に — 素の反応を残す。
  const step = (delta: number) => {
    const next = stepDay(pickedDay ?? today, delta);
    if (next !== null) onPickDay(next);
  };

  // バーの口と同じ見た目（余白の起点だけ違う: あちらは左に 4 足す）。
  const field: CSSProperties = {
    marginLeft: 4,
    padding: "4px 7px",
    border: `1px solid ${JB.line}`,
    background: "#fff",
    fontFamily: FONT_SANS,
    fontSize: 12,
  };

  return (
    // 日付 — 前後ボタン + カレンダーポップアップ
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ color: JB.muted, fontSize: 11 }}>日付</span>
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="前の日"
          style={{ ...NAV_BTN_STYLE, fontSize: 11 }}
        >
          ◀
        </button>
        <button
          type="button"
          onClick={calOpen ? () => setCalOpen(false) : openCalendar}
          style={{
            ...field,
            display: "flex",
            alignItems: "center",
            gap: 5,
            cursor: "pointer",
            color: pickedDay ? JB.ink : JB.muted,
          }}
        >
          <span style={{ fontSize: 12 }}>{pickedDay ? dayLabel(pickedDay) : "すべて"}</span>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="0.6" y="1.6" width="11.8" height="10.8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <line x1="0.6" y1="4.6" x2="12.4" y2="4.6" stroke="currentColor" strokeWidth="1.2"/>
            <line x1="3.5" y1="0" x2="3.5" y2="3.2" stroke="currentColor" strokeWidth="1.2"/>
            <line x1="9.5" y1="0" x2="9.5" y2="3.2" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="次の日"
          style={{ ...NAV_BTN_STYLE, fontSize: 11 }}
        >
          ▶
        </button>
        {pickedDay && (
          <button
            type="button"
            onClick={() => onPickDay(null)}
            aria-label="日付を解除"
            style={{ border: "none", background: "none", cursor: "pointer", color: JB.muted, fontSize: 12, padding: "0 2px" }}
          >
            ✕
          </button>
        )}
      </div>
      {calOpen && (
        <>
          {/* backdrop — ポップアップの外をクリックで閉じる */}
          <div
            style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 199 }}
            onClick={() => setCalOpen(false)}
          />
          <DeskCalendarPopup
            month={calMonth}
            onMonth={setCalMonth}
            pickedDay={pickedDay}
            onPickDay={(day) => { onPickDay(day); setCalOpen(false); }}
            articles={articles}
            today={today}
          />
        </>
      )}
    </div>
  );
}

const NAV_BTN_STYLE: CSSProperties = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontFamily: FONT_SANS,
  fontSize: 15,
  color: JB.muted,
  padding: "2px 6px",
  lineHeight: 1,
};

// ---- カレンダーポップアップ --------------------------------------------------

function DeskCalendarPopup({
  month,
  onMonth,
  pickedDay,
  onPickDay,
  articles,
  today,
}: {
  month: MonthRef;
  onMonth: (m: MonthRef) => void;
  pickedDay: string | null;
  onPickDay: (day: string) => void;
  articles: DeskArticle[];
  today: string;
}) {
  const counts = useMemo(() => countByPaperDay(articles), [articles]);
  const grid = useMemo(() => monthGrid(month), [month]);
  const focusDay = pickedDay ?? today;
  const focusCount = counts.get(focusDay) ?? 0;

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: 0,
        zIndex: 200,
        width: 272,
        background: "#fff",
        border: `1px solid ${JB.line}`,
        boxShadow: "0 4px 14px rgba(0,0,0,0.13)",
        fontFamily: FONT_SANS,
      }}
    >
      {/* ヘッダー: 月ナビ */}
      <div style={{ display: "flex", alignItems: "center", padding: "7px 8px", borderBottom: `1px solid ${JB.line}` }}>
        <button type="button" onClick={() => onMonth(stepMonth(month, -1))} style={NAV_BTN_STYLE}>←</button>
        <span style={{ flex: 1, textAlign: "center", fontFamily: FONT_SANS, fontSize: 13, color: JB.ink, fontWeight: 500 }}>
          {monthLabel(month)}
        </span>
        <button type="button" onClick={() => onMonth(stepMonth(month, 1))} style={NAV_BTN_STYLE}>→</button>
      </div>

      {/* 曜日見出し */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "4px 4px 0" }}>
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            style={{
              fontFamily: FONT_SANS,
              fontSize: 11,
              textAlign: "center",
              color: i === 0 ? JB.accent : i === 6 ? "#5577aa" : JB.muted,
              padding: "2px 0",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 日付グリッド（6週 × 7日） */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 4px 4px" }}>
        {grid.map((day) => {
          const inCurrent = inMonth(day, month);
          const isToday = day === today;
          const isPicked = day === pickedDay;
          const count = inCurrent ? (counts.get(day) ?? 0) : 0;
          const dayNum = Number(day.slice(8));
          return (
            <button
              key={day}
              type="button"
              onClick={() => { if (inCurrent) onPickDay(day); }}
              style={{
                background: isPicked ? JB.ink : "transparent",
                border: isToday ? `2px solid ${JB.accent}` : "2px solid transparent",
                color: isPicked ? "#fff" : inCurrent ? JB.ink : JB.line,
                fontFamily: FONT_SANS,
                fontSize: 13,
                padding: "2px 0",
                cursor: inCurrent ? "pointer" : "default",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 34,
                gap: 1,
              }}
            >
              <span>{dayNum}</span>
              {count > 0 && (
                <span style={{ fontSize: 9.5, color: isPicked ? "#ffb3b3" : JB.accent, lineHeight: 1 }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* フッター: 今日ボタン + 選択日情報 */}
      <div
        style={{
          borderTop: `1px solid ${JB.line}`,
          padding: "6px 10px",
          display: "flex",
          gap: 10,
          alignItems: "center",
          fontFamily: FONT_SANS,
          fontSize: 11.5,
          color: JB.muted,
        }}
      >
        <button
          type="button"
          onClick={() => onPickDay(today)}
          style={{
            fontFamily: FONT_SANS,
            fontSize: 11.5,
            border: `1px solid ${JB.line}`,
            background: "transparent",
            padding: "2px 8px",
            cursor: "pointer",
            color: JB.ink,
          }}
        >
          今日
        </button>
        <span>{dayLabel(focusDay)}</span>
        {focusCount > 0 && <span>記事 {focusCount} 本</span>}
      </div>
    </div>
  );
}
