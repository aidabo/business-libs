"use client";

import { FONT_SANS, FONT_SERIF, JB, eyebrow } from "../core";
import { usePaperSettings } from "../shared/PaperSettingsContext";
import usePaperDate, { usePaperEdition } from "../shared/usePaperDate";

// 編集局の面のヘッダ。墨の帯に、日付・版号・見ている人のロールを並べる。
// 日付と版号は edition.ts から導く（題字帯・紙面プレビューと同じ値になる）。
// 日付はサーバーと端末で食い違うため、描画後に端末の日付へ差し替える（hydration を避ける）。
export default function ConsoleHeader({
  roleLabel,
  scopeNote,
  status,
  readerHref = "/home/news",
}: {
  roleLabel?: string;
  scopeNote?: string;
  status?: "ok" | "error";
  /** 読者面の URL（「読者面を見る」の行き先）。Page Builder で作った読者面ならそのページ。 */
  readerHref?: string;
}) {
  const date = usePaperDate();
  const edition = usePaperEdition();
  const { paperName } = usePaperSettings();

  return (
    <header style={{ background: JB.ink, borderBottom: `1px solid ${JB.lineDark}` }}>
      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: "clamp(18px, 2.4vw, 26px) clamp(18px, 4.2vw, 36px)",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 13, height: 13, background: JB.accent, display: "block" }} />
          <span
            style={{
              fontFamily: FONT_SERIF,
              fontSize: "clamp(20px, 2.2vw, 24px)",
              fontWeight: 700,
              color: JB.paper,
              letterSpacing: "0.02em",
              lineHeight: 1,
            }}
          >
            {paperName}
          </span>
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 11,
              letterSpacing: "0.16em",
              color: JB.mutedOnDark,
              borderLeft: `1px solid ${JB.lineDark}`,
              paddingLeft: 12,
              lineHeight: 1.4,
            }}
          >
            編集局
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px 22px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 12.5,
              color: JB.mutedOnDark,
              letterSpacing: "0.04em",
            }}
          >
            {date ?? " "}　{edition ?? ""}
          </span>
          {roleLabel && (
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12.5,
                color: JB.mutedOnDark,
                letterSpacing: "0.04em",
                marginLeft: 12,
                borderLeft: `1px solid ${JB.lineDark}`,
                paddingLeft: 12,
              }}
            >
              {roleLabel}　{scopeNote}
            </span>
          )}
          {status && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${JB.lineDark}`, padding: "6px 12px" }}>
              <span className="jb-dot" style={{ width: 7, height: 7, background: status === "ok" ? "#4f9d6a" : JB.accent, display: "block" }} />
              <span style={{ ...eyebrow("#c9c0ad"), letterSpacing: "0.14em" }}>
                {status === "ok" ? "稼働中" : "Ghost に届いていません"}
              </span>
            </span>
          )}
          <a
            href={readerHref}
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: FONT_SANS,
              fontSize: 12,
              letterSpacing: "0.06em",
              color: JB.mutedOnDark,
              border: `1px solid ${JB.lineDark}`,
              padding: "6px 12px",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            読者面を見る ↗
          </a>
        </div>
      </div>
    </header>
  );
}
