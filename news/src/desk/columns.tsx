"use client";

import { useEffect, useState, type CSSProperties } from "react";

// 1 行の枚数（列数）の口。電子紙面（PaperEditions）・記事・素材の 3 タブが同じ 1 つを使う —
// 3 つに書くと、片方だけ直したときに選択肢も升の式も食い違う。
//
// 列は**絞りではない**。各タブの絞り（Filter）に入れない — 「解除」で見え方まで既定に跳ぶ。
// 選んだ数は**端末の好み**として localStorage に残す（タブごとに別の鍵）。

export type ColumnChoice = "auto" | "4" | "5" | "6" | "7" | "8";
export const COLUMN_CHOICES: readonly ColumnChoice[] = ["auto", "4", "5", "6", "7", "8"];

export const isColumnChoice = (value: unknown): value is ColumnChoice =>
  typeof value === "string" && (COLUMN_CHOICES as readonly string[]).includes(value);

function readColumns(key: string, fallback: ColumnChoice): ColumnChoice {
  // 使えない環境では既定に落ちる — ここで失敗を出さない（useNewsJobs の project と同じ作法）。
  try {
    const raw = localStorage.getItem(key);
    if (isColumnChoice(raw)) return raw;
  } catch { /* blocked */ }
  return fallback;
}

/** 選んだ列を端末に残す。`key` はタブごとに別。 */
export function useColumnChoice(key: string, fallback: ColumnChoice): [ColumnChoice, (c: ColumnChoice) => void] {
  const [cols, setCols] = useState<ColumnChoice>(() => readColumns(key, fallback));
  useEffect(() => {
    try {
      localStorage.setItem(key, cols);
    } catch { /* blocked */ }
  }, [key, cols]);
  return [cols, setCols];
}

/**
 * 升の列の式。「自動」は各タブの従来の詰め方（`autoMin` 以上で詰める）。
 *
 * 数を選んだときの升の下端は、**広い画面ではちょうど N 列で止まる** — auto-fill で N+1 列目が
 * 入るには隙間 1 本ぶん足りないため。狭い画面では床（`floor`）が勝って自動で減る（携帯は
 * 1〜2 列のまま、横にはみ出さない）。`gap` は升の間隔と**同じ値**を渡す — 違うと最終行がずれる。
 */
export function gridColumnsOf(cols: ColumnChoice, { autoMin, floor, gap }: { autoMin: string; floor: number; gap: number }): string {
  return cols === "auto"
    ? `repeat(auto-fill, minmax(${autoMin}, 1fr))`
    : `repeat(auto-fill, minmax(max(${floor}px, calc((100% - ${(Number(cols) - 1) * gap}px) / ${cols})), 1fr))`;
}

export function ColumnSelect({
  value,
  onChange,
  style,
}: {
  value: ColumnChoice;
  onChange: (c: ColumnChoice) => void;
  style?: CSSProperties;
}) {
  return (
    <select
      aria-label="1 行の枚数を選ぶ"
      value={value}
      onChange={(event) => { if (isColumnChoice(event.target.value)) onChange(event.target.value); }}
      style={style}
    >
      {COLUMN_CHOICES.map((choice) => (
        <option key={choice} value={choice}>
          {choice === "auto" ? "列: 自動" : `列: ${choice}`}
        </option>
      ))}
    </select>
  );
}
