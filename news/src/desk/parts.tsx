"use client";

import type { ReactNode } from "react";
import type { ArticleReadArtifacts } from "../core";
import { useEditPostHref } from "../adapter/NewsContext";
import { FONT_SANS, FONT_SERIF, JB, eyebrow } from "../core";
import {
  DESK_TABS,
  STATE_LABEL,
  dayLabel,
  faceOf,
  mediumLabelOfArticle,
  paperDayOfPost,
  stampLabel,
  type ArticleState,
  type DeskArticle,
  type DeskTabId,
  type DeskTag,
} from "./model";

/** タブの数。1 つの数か、名前つきの内訳（媒体と紙面タブの「媒体 1・紙面 9」）。 */
export type TabCount = number | { label: string; value: number }[];

// タブの数の単位（読み上げ用の aria-label）。タブの中の「N／M」の単位と揃える。
const TAB_COUNT_UNIT: Record<DeskTabId, string> = {
  paper: "面",
  articles: "本",
  assets: "点",
  read: "本",
  broadcast: "本",
  mediums: "本",
};

/**
 * 机のタブ帯。`?tab=` と同じ順番（spec §4.0）。
 * `counts` — タブの中身の数（Console の `deskTabCounts`）。どのタブも紺の数字で、0 も出す。
 * 文字はタブ名・数とも少し大きめ（2026-10-17 ユーザー指示）。数はタブ名と色を分けて読み分けられるようにする。
 */
export function TabBar({
  value,
  onChange,
  counts,
  tabs,
}: {
  value: DeskTabId;
  onChange: (id: DeskTabId) => void;
  /** 出すタブ（Page Builder で一部だけ置くとき）。無ければ全部。 */
  tabs?: readonly DeskTabId[];
  /** タブの数。どのタブも同じ紺の小さな数で出す。無いタブ（まだ読めていない）は出さない。 */
  counts?: Partial<Record<DeskTabId, TabCount>>;
}) {
  return (
    <nav
      aria-label="作業台"
      style={{
        display: "flex",
        gap: 0,
        borderBottom: `1px solid ${JB.line}`,
        background: JB.white,
        flexWrap: "wrap",
      }}
    >
      {DESK_TABS.filter((tab) => !tabs || tabs.includes(tab.id)).map((tab) => {
        const on = tab.id === value;
        const emphasis = "emphasis" in tab;
        const count = counts?.[tab.id];
        const parts = typeof count === "number" ? [{ label: "", value: count }] : count;
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={on ? "page" : undefined}
            onClick={() => onChange(tab.id)}
            style={{
              fontFamily: FONT_SANS,
              // PC は大きめ（15 / 放送 16）。携帯は元の大きさ（13 / 14.5）まで縮めて、タブ帯が 3 段に折れないようにする。
              fontSize: emphasis ? "clamp(14.5px, calc(1.2vw + 9.5px), 16px)" : "clamp(13px, calc(1.2vw + 8px), 15px)",
              letterSpacing: "0.06em",
              padding: "12px clamp(14px, 2vw, 22px)",
              border: "none",
              borderBottom: `2px solid ${on ? JB.accent : "transparent"}`,
              background: "transparent",
              color: emphasis ? JB.accent : on ? JB.ink : JB.muted,
              cursor: "pointer",
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {tab.label}
            {parts && (
              <span
                aria-label={parts.map((p) => `${p.label}${p.value}${TAB_COUNT_UNIT[tab.id]}`).join("・")}
                style={{ fontFamily: FONT_SANS, fontSize: 12.5, fontWeight: 600, color: JB.navy, letterSpacing: 0 }}
              >
                {parts.map((p) => `${p.label ? `${p.label} ` : ""}${p.value}`).join("・")}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

/**
 * 赤帯。**取れなかった理由を出す。** 数字や一覧で埋めない（spec §4.0・V6）。
 * 「まだ無い」（DeskEmpty）と混ぜない。
 */
export function DeskError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        border: `1px solid ${JB.accent}`,
        borderLeft: `4px solid ${JB.accent}`,
        background: JB.white,
        padding: "14px clamp(14px, 2vw, 18px)",
        fontFamily: FONT_SANS,
        fontSize: 13,
        lineHeight: 1.9,
        color: JB.ink,
      }}
    >
      <strong style={{ color: JB.accent }}>Ghost から取れませんでした。</strong> {message}
      <div style={{ color: JB.muted, marginTop: 6 }}>
        画面の数字と一覧は出しません（古い値や作り値を出さない方針です）。
      </div>
    </div>
  );
}

/**
 * 赤帯。**書けなかった理由を出す**（読みの失敗は DeskError）。
 *
 * DeskError を流用しない。あちらは「Ghost から取れませんでした。」と前置きし、
 * 「画面の数字と一覧は出しません」と言う — どちらも読みの失敗の話で、
 * **読めているのに書けなかった**ときは嘘になる。ここは一覧を出したままにする。
 *
 * 「記事は変えていません」とは書かない。応答が返らなかった場合、
 * Ghost 側で実際に何が起きたかは外から断定できない。言えるのは画面のことだけ。
 */
export function DeskWriteError({ message, onReload }: { message: string; onReload: () => void }) {
  return (
    <div
      role="alert"
      style={{
        border: `1px solid ${JB.accent}`,
        borderLeft: `4px solid ${JB.accent}`,
        background: JB.white,
        padding: "14px clamp(14px, 2vw, 18px)",
        fontFamily: FONT_SANS,
        fontSize: 13,
        lineHeight: 1.9,
        color: JB.ink,
      }}
    >
      <strong style={{ color: JB.accent }}>Ghost に書けませんでした。</strong> {message}
      <div style={{ color: JB.muted, marginTop: 6 }}>
        一覧は書く前のままです。読み直すと今の姿になります。
      </div>
      <button type="button" onClick={onReload} style={{ ...buttonStyle(false), marginTop: 10 }}>
        読み直す
      </button>
    </div>
  );
}

/** まだ何も無い、という文。**取れなかった（DeskError）と混ぜない。** */
export function DeskEmpty({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontFamily: FONT_SANS, fontSize: 13, lineHeight: 1.9, color: JB.muted, margin: 0 }}>
      {children}
    </p>
  );
}

/**
 * 記事を**既存の /editor** で開く（別のタブ）。
 *
 * 記事を書く・直す・公開する（予約公開も）は `/editor` が既に持っている。机は同じ操作の
 * 2 つ目の口を作らない — 作ると片方だけ直したときに食い違う。リンクの組み立ては
 * 他の画面と同じ `resolvePostEditLink` 1 本（id が無ければ空を返すので、そのときは出さない）。
 */
export function EditLink({ postId, canEdit = true }: { postId: string; canEdit?: boolean }) {
  const href = useEditPostHref()(postId);
  if (href === "") return null;
  // 編集できない記事はリンクにしない（開いても Ghost が保存を断る）。押せない見た目で理由を添える。
  // 判定は `canEditArticle`（model.ts）1 本 — 呼び側がそれを渡す。
  if (!canEdit) {
    return (
      <span
        role="link"
        aria-disabled="true"
        title={NO_EDIT_NOTE}
        aria-label={`編集（${NO_EDIT_NOTE}）`}
        style={{ ...editorLinkStyle, color: JB.muted, opacity: 0.45, cursor: "not-allowed" }}
      >
        編集
      </span>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" style={editorLinkStyle}>
      編集
    </a>
  );
}

/** 編集できない記事の「編集」に添える理由。 */
export const NO_EDIT_NOTE = "この記事を編集する権限がありません";

/**
 * `/editor` を開く口の見た目。「編集」（`EditLink`）と、新しく書く 1 枚の中の「開けなかった」ときの
 * リンクが使う（「新しく書く」のボタン自体は机の主な操作として朱の塗りで大きく出す・2026-10-15）。
 */
export const editorLinkStyle: React.CSSProperties = {
  fontFamily: FONT_SANS,
  fontSize: 12,
  letterSpacing: "0.04em",
  padding: "3px 10px",
  border: `1px solid ${JB.line}`,
  color: JB.ink,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

/** 1 枚（`WriteDialog`・`NewArticleDialog`）の中の入力欄の見た目。同じ 1 つを使う。 */
export const fieldStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "8px 10px",
  border: `1px solid ${JB.line}`,
  background: JB.white,
  fontFamily: FONT_SANS,
  fontSize: 13,
  color: JB.ink,
};

/**
 * 記事の状態の印。**時刻の在る状態には時刻を添える。**
 *
 * 予約は「いつ出るか」、公開は「いつ出たか」。公開が「公開」だけだった頃は、一覧の
 * どこにも公開日が出ていなかった（ユーザー指示 2026-10-07「公開日も一目で分かるように」）。
 * 下書きは `published_at` を持たないので、そのまま「下書き」。
 * 予約の時刻を過ぎているものだけ赤（spec §4.1・V11）。
 */
/**
 * `solid` は写真の上に重ねるとき用（記事タブのカード）。素の版は背景が透けるので、
 * 絵の上では灰の文字が写真に溶けて読めない — 地を塗り、公開は墨・下書きは白で分ける。
 */
export function StateChip({ state, at, solid = false }: { state: ArticleState; at: string | null; solid?: boolean }) {
  const red = state === "overdue";
  const stamp = state === "draft" ? "" : stampLabel(at);
  const solidStyle: React.CSSProperties = solid
    ? state === "published"
      ? { background: JB.ink, color: "#fff", border: `1px solid ${JB.ink}` }
      : red
        ? { background: JB.accent, color: "#fff", border: `1px solid ${JB.accent}` }
        : { background: "#fff", color: JB.ink, border: `1px solid ${JB.line}` }
    : {};
  return (
    <span
      style={{
        fontFamily: FONT_SANS,
        fontSize: 11,
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
        border: `1px solid ${red ? JB.accent : JB.line}`,
        color: red ? JB.accent : JB.muted,
        padding: "2px 7px",
        ...solidStyle,
      }}
    >
      {stamp === "" ? STATE_LABEL[state] : `${STATE_LABEL[state]} ${stamp}`}
    </span>
  );
}

/**
 * 記事の素性の印（面・媒体・紙面日）。**紙面タブと記事タブが同じ 1 本を使う** —
 * 2 つに書くと、同じ記事が 2 つの一覧で違う姿になり、片方だけ直したときに食い違う。
 *
 * - 面は `faceOf`（面タグの表から読むので Ghost のタグは要らない）。無ければ「面なし」。
 * - 媒体は机が媒体として知っているタグから引く（`mediumLabelOfArticle`）。机が媒体を
 *   1 つも知らなければ何も出さない — 「無い」と「まだ知らない」を混ぜない。
 * - 紙面日は**公開時刻の在る記事だけ**。`paperDayOfPost` は下書きでは `updated_at` に
 *   落ちるので、それを出すと「最後に触った日」が紙面の日になる。
 */
export function ArticleMeta({ article, mediums }: { article: DeskArticle; mediums: DeskTag[] }) {
  const face = faceOf(article)?.label ?? "";
  const medium = mediumLabelOfArticle(article, mediums);
  const paperDay = article.published_at ? dayLabel(paperDayOfPost(article)) : "";
  return (
    <>
      <span style={face === "" ? metaQuiet : metaChip}>{face === "" ? "面なし" : face}</span>
      {medium !== "" && <span style={medium === "媒体なし" ? metaQuiet : metaChip}>{medium}</span>}
      {paperDay !== "" && <span style={metaQuiet}>紙面 {paperDay}</span>}
    </>
  );
}

/** 書き手（複数は「・」でつなぐ）。名前が 1 つも無ければ何も出さない。記事タブと素材タブが同じ 1 つを使う。 */
export function AuthorNames({ article }: { article: Pick<DeskArticle, "authorNames"> }) {
  const names = article.authorNames ?? [];
  if (names.length === 0) return null;
  // 面・媒体・紙面日の淡い文字と見分けられるよう、書き手だけ深藍で（ユーザー指示 2026-10-14）。
  return <span style={{ ...metaQuiet, color: JB.navy }} title="書き手">{names.join("・")}</span>;
}

/**
 * 素性の印（面・媒体）。在る物は丸いチップで、無い物（面なし・媒体なし）は淡い文字で。
 * 押せるボタンに見えないよう、角の丸い薄い地の楕円にする（StackPage の PostListCard の
 * タグチップと同じ姿 — ユーザー指示 2026-10-14）。
 */
const metaChip: React.CSSProperties = {
  fontFamily: FONT_SANS,
  fontSize: 11,
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
  border: `1px solid ${JB.line}`,
  borderRadius: 999,
  background: JB.paper,
  color: JB.inkSoft,
  padding: "1px 8px",
  lineHeight: 1.6,
};

/** 淡い側（面なし・媒体なし・紙面日）。 */
const metaQuiet: React.CSSProperties = {
  fontFamily: FONT_SANS,
  fontSize: 11.5,
  whiteSpace: "nowrap",
  color: JB.muted,
};

/**
 * 読み上げの印（🔊 音声・🎬 アバター放送）。**開ける成果物へのリンク**そのもので、
 * 「有る」の表示ではない — 押すと新しいタブで開いて確かめる（ユーザー要望）。
 *
 * **紙面タブと記事タブが同じ 1 本を使う**（ユーザー指示 2026-10-07）— 2 つに書くと、
 * 同じ記事が 2 つの一覧で違う印になり、片方だけ直したときに食い違う。載せる URL は
 * 索引（`indexArticleArtifacts`）が `artifactUrl` で絞った物だけなので、ここでは絞らない。
 * 無い記事には何も出さない（「まだ」と「無い」を混ぜない。V1）。
 */
export function ArtifactIcons({ read }: { read: ArticleReadArtifacts | null }) {
  return (
    <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
      {read?.voice && (
        <a
          href={read.voice}
          target="_blank"
          rel="noreferrer"
          title="音声読み上げを開く"
          aria-label="音声読み上げを開く"
          style={{ textDecoration: "none" }}
        >
          <ArtifactBadge kind="voice" />
        </a>
      )}
      {read?.avatar && (
        <a
          href={read.avatar}
          target="_blank"
          rel="noreferrer"
          title="アバター放送を開く"
          aria-label="アバター放送を開く"
          style={{ textDecoration: "none" }}
        >
          <ArtifactBadge kind="avatar" />
        </a>
      )}
    </span>
  );
}

/**
 * 印の見た目（字 + 絵 + 色）。凡例と行の印が**同じ 1 本**を使う。
 * もとは絵文字 1 字（12.5px）で、小さく色も OS 任せで見分けにくかった（ユーザー指示 2026-10-12）—
 * 字で「音声」「放送」と書き、色も分ける（音声=藍、放送=朱）。
 */
export function ArtifactBadge({ kind, label }: { kind: "voice" | "avatar"; /** 字を替える（放送カードの「アバター 1」など）。既定は「音声」「放送」。 */ label?: string }) {
  const voice = kind === "voice";
  const color = voice ? "#1d5fa0" : JB.accent;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: FONT_SANS,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: "nowrap",
        color,
        background: voice ? "#e9f1fa" : "#fbecec",
        border: `1px solid ${color}`,
        padding: "4px 8px",
      }}
    >
      {voice ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" />
          <path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.5a6 6 0 0 1 0 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1" y="4" width="10" height="8" rx="1.2" fill="currentColor" />
          <path d="M11.5 7 15 5v6l-3.5-2z" fill="currentColor" />
        </svg>
      )}
      {label ?? (voice ? "音声" : "放送")}
    </span>
  );
}

/**
 * 書く前の 1 枚。何がどう変わるかを文で出し、押すまで書かない（spec §4.0）。
 * 押す字は「OK」ではなく、起きることそのもの。
 */
export function ConfirmSheet({
  open,
  title,
  lines,
  okLabel,
  busy,
  blocked,
  onOk,
  onCancel,
  children,
}: {
  open: boolean;
  title: string;
  lines: string[];
  okLabel: string;
  busy?: boolean;
  /**
   * **押せない理由**（`busy` のほかに）。ボタンを止めるためだけに使う — 理由は `lines` に
   * 出ていること。押しても何も起きないボタンは作らない（`MediumsTab` の改名がその形で、
   * 名前を変えていないのに押せて、押すと黙って戻っていた）。
   */
  blocked?: boolean;
  onOk: () => void;
  onCancel: () => void;
  /**
   * 文の下に出す物（改名の入力欄など）。**`lines` は呼び側が毎描画組み直す**ので、
   * 打つそばから「何がどう変わるか」が変わる（打ち終わってから警告が出る形にしない）。
   */
  children?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20, 18, 14, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 80,
      }}
    >
      <div style={{ background: JB.white, border: `1px solid ${JB.ink}`, maxWidth: 560, width: "100%" }}>
        <div style={{ borderBottom: `1px solid ${JB.ink}`, padding: "14px 18px" }}>
          <div style={eyebrow(JB.accent)}>確認</div>
          <h3 style={{ fontFamily: FONT_SERIF, fontSize: 17, margin: "6px 0 0", color: JB.ink }}>
            {title}
          </h3>
        </div>
        <ul style={{ margin: 0, padding: "14px 18px 14px 34px", fontFamily: FONT_SANS, fontSize: 13, lineHeight: 2, color: JB.ink }}>
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {children && <div style={{ padding: "0 18px 4px" }}>{children}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "0 18px 16px" }}>
          <button type="button" onClick={onCancel} style={buttonStyle(false)}>
            やめる
          </button>
          {/* 止めるのは 2 つの理由 — `busy`（今書いている）と `blocked`（書く理由が無い）。
              文（`busy ? …`）を `blocked` に引きずらせない: 書いていないのに
              「書いています…」と出る。 */}
          <button type="button" onClick={onOk} disabled={busy || blocked} style={buttonStyle(true, busy || blocked)}>
            {busy ? "書いています…" : okLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// 押せないボタンは見た目でも押せないと分かるようにする（押せる時と同じ色だと、押しても
// 何も起きず理由にも気づけない — 2026-10-16 の「新しく書く」の指摘）。
function buttonStyle(primary: boolean, disabled = false): React.CSSProperties {
  return {
    fontFamily: FONT_SANS,
    fontSize: 12.5,
    letterSpacing: "0.06em",
    padding: "8px 16px",
    border: `1px solid ${disabled ? JB.line : primary ? JB.accent : JB.line}`,
    background: disabled ? JB.line : primary ? JB.accent : "transparent",
    color: disabled ? JB.muted : primary ? JB.paper : JB.ink,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}
