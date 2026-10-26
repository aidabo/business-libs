"use client";

import { useMemo, useState } from "react";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import {
  WEEKDAY_LABELS,
  countByPaperDay,
  dayLabel,
  inMonth,
  monthGrid,
  monthLabel,
  monthOf,
  stepMonth,
  todayPaperDay,
  type DeskArticle,
  type MonthRef,
} from "./model";

/**
 * 紙面日の選択カード。**打った日を選ぶ**（日付ボタンを横に並べない）。
 *
 * 日の並びは暦の算術（`monthGrid` など model の純関数）だけで組み、紙面日の出所は
 * `paperDayOfPost` 1 本のまま。ここが持つ状態は「開いている月」だけで、選ばれた日は
 * 親（紙面タブ）が持つ — 面の一覧と選んだ日が食い違わないように。
 *
 * 記事の無い日も押せる（「この日の記事はまだありません」を出すため。押せないと
 * 「まだ読めていない」のか「まだ無い」のかが分からなくなる）。
 */
export default function PaperCalendar({
  articles,
  value,
  onPick,
}: {
  articles: DeskArticle[];
  /** いま選ばれている紙面日（"" もありうる）。 */
  value: string;
  onPick: (day: string) => void;
}) {
  const today = useMemo(() => todayPaperDay(new Date()), []);
  const counts = useMemo(() => countByPaperDay(articles), [articles]);
  const [month, setMonth] = useState<MonthRef>(
    () => monthOf(value) ?? monthOf(today) ?? { year: 1970, month: 1 }
  );

  const cells = useMemo(() => monthGrid(month), [month]);

  return (
    <div
      style={{
        border: `1px solid ${JB.line}`,
        background: JB.white,
        padding: "12px clamp(10px, 2vw, 14px) 14px",
        maxWidth: 460,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
        <button type="button" onClick={() => setMonth((ref) => stepMonth(ref, -1))} style={arrowStyle} aria-label="前の月">
          ←
        </button>
        <div style={{ flex: 1, textAlign: "center", fontFamily: FONT_SERIF, fontSize: 15, color: JB.ink }}>
          {monthLabel(month)}
        </div>
        <button type="button" onClick={() => setMonth((ref) => stepMonth(ref, 1))} style={arrowStyle} aria-label="次の月">
          →
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 2 }}>
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={label}
            style={{
              fontFamily: FONT_SANS,
              fontSize: 10.5,
              textAlign: "center",
              paddingBottom: 4,
              color: index === 0 ? JB.accent : JB.muted,
            }}
          >
            {label}
          </div>
        ))}

        {cells.map((day) => {
          const count = counts.get(day) ?? 0;
          const selected = day === value;
          const here = inMonth(day, month);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onPick(day)}
              aria-pressed={selected}
              aria-label={`${dayLabel(day)} の紙面${count > 0 ? `（記事 ${count} 本）` : "（記事なし）"}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                minHeight: 40,
                padding: "4px 0",
                border: `1px solid ${day === today && !selected ? JB.accent : "transparent"}`,
                background: selected ? JB.ink : "transparent",
                color: selected ? JB.paper : here ? JB.ink : JB.muted,
                opacity: here ? 1 : 0.45,
                cursor: "pointer",
                fontFamily: FONT_SANS,
              }}
            >
              <span style={{ fontSize: 12.5 }}>{Number(day.slice(8))}</span>
              {count > 0 && (
                // 件数は朱（ユーザー指示 2026-10-04）。テーマの色規則で「番号・強調」は朱 —
                // 面番号や第一面の主役と同じ色で、日付の墨・補助文字の灰とは別の色に見える。
                // **選んだ日だけは紙色**。升目が墨なので、朱のままだと 2.8:1 まで沈む（10px では読めない）。
                <span style={{ fontSize: 10, color: selected ? JB.paper : JB.accent }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => {
            setMonth(monthOf(today) ?? month);
            onPick(today);
          }}
          style={arrowStyle}
        >
          今日
        </button>
        <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: JB.muted }}>
          {value ? `${dayLabel(value)}　記事 ${counts.get(value) ?? 0} 本` : "日を選んでください"}
        </span>
      </div>
    </div>
  );
}

const arrowStyle: React.CSSProperties = {
  fontFamily: FONT_SANS,
  fontSize: 12,
  padding: "3px 9px",
  border: `1px solid ${JB.line}`,
  background: "transparent",
  color: JB.ink,
  cursor: "pointer",
};
