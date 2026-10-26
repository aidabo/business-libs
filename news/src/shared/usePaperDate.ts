"use client";

import { useEffect, useState } from "react";
import { editionLabel, paperDay } from "../core";
import { usePaperSettings } from "./PaperSettingsContext";

/**
 * 今日の紙面日付。サーバーでは null を返し、マウント後に埋める。
 *
 * 直接 paperDay() を描画中に呼ぶと、サーバー（ビルド機の時刻）とクライアント
 * （閲覧者の時刻）で日付が違い、React が不一致を警告する。
 * 既存の console/ConsoleHeader.tsx と同じ手を使う。
 */
export default function usePaperDate(): string | null {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    setValue(paperDay());
  }, []);

  return value;
}

/**
 * 今日の版号（「第 10,015 号」）。usePaperDate と同じく、サーバーでは null を返し
 * マウント後に埋める（号数は日付で決まるので、描画中に作ると同じずれが起きる）。
 */
export function usePaperEdition(): string | null {
  const settings = usePaperSettings();
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    setValue(editionLabel(0, new Date(), settings));
  }, [settings]);

  return value;
}
