"use client";

import { FONT_SANS, FONT_SERIF, JB } from "../core";
import { ACCESS_LABEL, countByAccess, countByState, paperDayOfPost, todayPaperDay, type DeskArticle } from "./model";
import type { DeskStatus } from "./useDesk";

/**
 * 机の数字。**実数だけを出す。**
 *
 * 「会員数 11,204」「購読者 4,210」は作り物だったので消した（spec §5）。記事数は机が
 * 読んだ実数で、取れなければ数を出さず理由を出す（古い値も作り値も出さない・V1）。
 *
 * 状態は 3 つある。**`ready` 以外を「取れなかった」に畳まない。** 読み込み中に
 * 「取れませんでした」と出すのは、まだ頼んでいないことを失敗と言うのと同じ（V1）。
 * 失敗の理由そのものは帯（DeskError）が出すので、ここは数字を出すか出さないかだけ。
 */
export default function MetricCards({ status, articles, now }: { status: DeskStatus; articles: DeskArticle[]; now: Date }) {
  if (status !== "ready") {
    return (
      <div style={{ border: `1px solid ${JB.line}`, background: JB.white, padding: "14px 18px", fontFamily: FONT_SANS, fontSize: 12.5, color: JB.muted }}>
        {status === "error" ? "記事数は取れませんでした。" : "読み込んでいます…"}
      </div>
    );
  }

  const today = todayPaperDay(now);
  const todayArticles = articles.filter((a) => paperDayOfPost(a) === today);
  const todayCounts = countByState(todayArticles, now);

  const counts = countByState(articles, now);
  const access = countByAccess(articles);
  // 1 段目は状態、2 段目は記事の総数と公開範囲（並びは PaperStyles の .jb-metrics を参照）。
  const cells: { label: string; short?: string; value: number; red?: boolean }[] = [
    { label: "公開", value: counts.published },
    { label: "予約", value: counts.scheduled },
    { label: "下書き", value: counts.draft },
    // 狭い画面では 2 行に折れて段の高さが揃わないので短い名前にする（`short`）。
    { label: "予約の時刻を過ぎ", short: "予約超過", value: counts.overdue, red: true },
    { label: "記事（全部）", value: counts.total },
    // 誰に開いているか（Ghost の `visibility`）。**作り物の購読者数は出さない** —
    // これは記事の側の実数で、会員が何人いるかではない（spec §5）。
    { label: ACCESS_LABEL.public, value: access.public },
    { label: ACCESS_LABEL.members, value: access.members },
    { label: ACCESS_LABEL.paid, value: access.paid },
    // 区分不明は 0 のときは出さない。0 を並べても読む人の判断が増えない一方、
    // 1 本でも在れば「これは何か」と気づける必要がある。
    ...(access.other > 0 ? [{ label: ACCESS_LABEL.other, value: access.other, red: true }] : []),
  ];

  const label: React.CSSProperties = { fontFamily: FONT_SANS, color: JB.muted };
  const num: React.CSSProperties = { fontFamily: FONT_SERIF, fontWeight: 600, color: JB.ink, lineHeight: 1.2 };
  const small: React.CSSProperties = { fontFamily: FONT_SANS, fontSize: 11, fontWeight: 400, marginLeft: 3, color: JB.muted };

  return (
    <div className="jb-metrics">
      {/* 今日の紙面サマリ（広い画面は 1 段目の左、狭い画面は幅いっぱいの 1 行） */}
      <div className="jb-metric jb-metric-today" style={{ border: `1px solid ${todayCounts.overdue > 0 ? JB.accent : JB.line}`, background: JB.white }}>
        <div className="jb-metric-label" style={label}>今日の紙面　{today}</div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0 12px" }}>
          <span className="jb-metric-num" style={num}>{todayCounts.published}<span style={small}>公開</span></span>
          <span className="jb-metric-num" style={num}>{todayCounts.scheduled}<span style={small}>予約</span></span>
          <span className="jb-metric-num" style={num}>{todayCounts.draft}<span style={small}>下書き</span></span>
          {todayCounts.overdue > 0 && (
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: JB.accent, fontWeight: 600 }}>⚠ 予約の時刻を過ぎ {todayCounts.overdue}</span>
          )}
          {todayArticles.length === 0 && (
            <span style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: JB.muted }}>今日付きの記事はまだありません</span>
          )}
        </div>
      </div>

      {/* 全体の数字 */}
      {cells.map((cell) => {
        const red = cell.red && cell.value > 0;
        return (
          <div key={cell.label} className="jb-metric" style={{ border: `1px solid ${red ? JB.accent : JB.line}`, background: JB.white }}>
            <div className="jb-metric-label" style={label} title={cell.label}>
              {cell.short ? (
                <>
                  <span className="jb-metric-long">{cell.label}</span>
                  <span className="jb-metric-short">{cell.short}</span>
                </>
              ) : (
                cell.label
              )}
            </div>
            <div className="jb-metric-num" style={{ ...num, color: red ? JB.accent : JB.ink }}>
              {cell.value.toLocaleString("ja-JP")}
            </div>
          </div>
        );
      })}
    </div>
  );
}
