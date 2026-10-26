"use client";

import { useEffect, useState } from "react";
import { facePrintOf, type Face } from "../core";
import { FONT_SANS, JB } from "../core";
import { faceChoicesOf, newArticleEditorHref, type DeskTag } from "./model";
import { ConfirmSheet, editorLinkStyle, fieldStyle } from "./parts";

/**
 * **新しく記事を書く口。** 先に割付（面・媒体）を決める 1 枚を出し、決めたら既存の
 * `/editor` を id なしで開く（`app/editor/[[...postsId]]` の省略可能な部分がそのまま
 * 「新しい記事」になる）。
 *
 * 選んだ 2 つは `/editor` の `?tagname=` に**名前で**載り、開いた新規記事に最初から付く
 * （`/tag` の「新しい投稿」と同じ道。組むのは `newArticleEditorHref` 1 本）。
 *
 * **媒体か面のどちらかを選ばないと開けない**（ユーザー決定 2026-10-15。2026-10-04 の「選ばなくても
 * 開ける」をやめた）。机に載るのはニュースの記事＝面か媒体のタグがある記事だけ（`isNewsArticle`）なので、
 * どちらも無しで書き始めると、書いた記事が机から消えて「割付」でも直せない。`/editor` を直に使う道は
 * ここでは見ない。**本文を書く・公開する（予約も）はここでは持たない** — 「編集」と同じ理由で、
 * 既存の `/editor` が持っている。
 *
 * 口は机に 2 つある（一番上と、記事タブの一番下）。どちらも同じこの部品で、同じ 1 枚を開く。
 */
export default function NewArticleDialog({
  faces,
  tags,
  mediums,
  placement = "top",
}: {
  /** 面の表（`desk.faces`）。選択肢は実在するタグを持つ面だけに絞る（`faceChoicesOf`）。 */
  faces: Face[];
  /** 机が読んだタグ全部（`desk.tags`）。面タグの**名前**をここから取る。 */
  tags: DeskTag[];
  /** 媒体の表（`desk.mediums`）。名前をそのまま載せる。 */
  mediums: DeskTag[];
  /** 置き場所（試験と a11y の名前の区別用）。見た目は同じ。 */
  placement?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  // 選んだ物は**閉じても残す**。続けて同じ面に書くことが多い（選び直しの手間を消す）ので、
  // 選び直さずに押せば前回の割付が付く。残るのはこの 1 枚が載っている間だけ — 記事タブを
  // 離れると `Console` はタブごと外すので消える（そこまでは持ち回らない）。
  const [faceSlug, setFaceSlug] = useState("");
  const [mediumSlug, setMediumSlug] = useState("");
  // 新しいタブを開けなかったとき（ブラウザのポップアップの抑制）。黙って閉じない。
  const [blockedHref, setBlockedHref] = useState<string | null>(null);
  // 選ばずに「新規記事を開く」を押したか。押せないボタンにすると、押しても何も起きず
  // 理由にも気づけなかった（ユーザー指摘 2026-10-16）ので、押させてからエラーを出す。
  const [triedMissing, setTriedMissing] = useState(false);

  const faceChoices = faceChoicesOf(faces, tags);
  const face = faceChoices.find((choice) => choice.slug === faceSlug);
  const medium = mediums.find((tag) => tag.slug === mediumSlug);
  const href = newArticleEditorHref(medium?.name ?? "", face?.name ?? "");

  // 選んだタグが消えた・名前が変わった（面は**名前**で引く）ときは、選びも一緒に落とす。
  // 残すと、押したときに `lines` にも URL にも出ないまま**黙って**落ちるうえ、選択の欄は
  // 空なのに選びだけが後で復活する（`<select>` は合う `option` が無いと何も選ばない）。
  const faceGone = faceSlug !== "" && !face;
  const mediumGone = mediumSlug !== "" && !medium;
  useEffect(() => {
    if (faceGone) setFaceSlug("");
    if (mediumGone) setMediumSlug("");
  }, [faceGone, mediumGone]);

  // 媒体か面の**どちらか**が要る（どちらか 1 つで足りる）。無いまま押したらエラーを出す。
  const missing = !medium && !face;
  // エラーは、選べば消える（押し直しを待たない）。
  const showMissingError = triedMissing && missing;

  // 文は描くたびに組み直す（`ConfirmSheet` の約束）— 選んだ瞬間に「何が付くか」が変わる。
  const lines = [
    "選んだ媒体と面は、開いた先の新規記事に最初から付きます。",
    ...(missing
      ? [NEEDS_MEDIUM_OR_FACE]
      : [
          ...(medium ? [`媒体: ${medium.name}`] : []),
          ...(face ? [`面: ${face.name}`] : []),
        ]),
    "本文を書く・公開する（予約も）は、開いた先の画面が持ちます。",
  ];

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => {
          setBlockedHref(null); // 開き直しは新しい試み（前回の「開けなかった」を残さない）
          setTriedMissing(false);
          setOpen(true);
        }}
        data-placement={placement}
        style={NEW_ARTICLE_BUTTON}
      >
        新しく書く
      </button>
      <ConfirmSheet
        open={open}
        title="割付を決めて新しく書く"
        lines={lines}
        okLabel="新規記事を開く"
        onOk={() => {
          if (missing) {
            setTriedMissing(true);
            return;
          }
          // 机は開いたままにする（「編集」と同じ別のタブ）。`EditorComponent` も同じ形で開く。
          const opened = window.open(href, "_blank");
          if (opened) {
            setOpen(false);
            return;
          }
          // 開けなかった。閉じると「押したのに何も起きない」になるので、1 枚は開いたまま
          // **手で押せるリンク**を出す（この画面の他の口は `<a>` なので、そもそも塞がれない）。
          setBlockedHref(href);
        }}
        onCancel={() => setOpen(false)}
      >
        {/* 並びは**媒体 → 面**。`lines` と `newArticleEditorHref` が載せる順と同じにする。 */}
        <div style={{ display: "grid", gap: 12, fontFamily: FONT_SANS, fontSize: 13, color: JB.ink }}>
          <label>
            媒体
            <select
              value={mediumSlug}
              onChange={(e) => setMediumSlug(e.target.value)}
              aria-invalid={showMissingError || undefined}
              style={showMissingError ? invalidFieldStyle : fieldStyle}
            >
              <option value="">（媒体なし）</option>
              {mediums.map((tag) => (
                <option key={tag.slug} value={tag.slug}>
                  {tag.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            面
            <select
              value={faceSlug}
              onChange={(e) => setFaceSlug(e.target.value)}
              aria-invalid={showMissingError || undefined}
              style={showMissingError ? invalidFieldStyle : fieldStyle}
            >
              <option value="">（面なし）</option>
              {faceChoices.map((choice) => (
                <option key={choice.slug} value={choice.slug}>
                  {facePrintOf(choice.label)} {choice.label}
                </option>
              ))}
            </select>
          </label>

          <div style={{ color: JB.muted, fontSize: 11.5, lineHeight: 1.8 }}>
            主役と絵はここでは決めません — まだ書いていない記事には、絵も主役も無いためです
            （書いたあとに机の「割付」で決められます）。
          </div>

          {showMissingError && (
            // エラーは文まで赤で出す（ユーザー指示 2026-10-16）。
            <div role="alert" style={{ ...ALERT_BOX, color: JB.accent, background: "#fdf1f1" }}>
              <strong>{MISSING_MEDIUM_OR_FACE_ERROR}</strong> {NEEDS_MEDIUM_OR_FACE}
            </div>
          )}

          {blockedHref !== null && (
            <div role="alert" style={ALERT_BOX}>
              <strong style={{ color: JB.accent }}>新しいタブを開けませんでした。</strong>{" "}
              ブラウザが開かなかったので、記事はまだ開いていません。下のリンクから開けます。
              <div style={{ marginTop: 6 }}>
                <a href={blockedHref} target="_blank" rel="noreferrer" style={editorLinkStyle}>
                  新規記事を開く
                </a>
              </div>
            </div>
          )}
        </div>
      </ConfirmSheet>
    </>
  );
}

/** 媒体も面も選んでいないときの理由（説明の箇条書きと、押したときのエラーに出る）。 */
export const NEEDS_MEDIUM_OR_FACE = "媒体か面のどちらかを選んでください（ニュースの記事は面か媒体のタグで机に載ります）。";

/** 選ばずに「新規記事を開く」を押したときのエラーの見出し。 */
export const MISSING_MEDIUM_OR_FACE_ERROR = "媒体も面も選ばれていません。";

/** ダイアログ内のエラー（未選択・新しいタブを開けなかった）の箱。 */
const ALERT_BOX: React.CSSProperties = {
  border: `1px solid ${JB.accent}`,
  borderLeft: `4px solid ${JB.accent}`,
  background: JB.white,
  padding: "10px 12px",
  fontSize: 12.5,
  lineHeight: 1.9,
  color: JB.ink,
};

/** 未選択のまま押したときの選択欄（枠を朱に）。 */
const invalidFieldStyle: React.CSSProperties = { ...fieldStyle, borderColor: JB.accent };

/** 「新しく書く」の見た目。机の主な操作なので朱の塗りで大きめに（ユーザー指示 2026-10-15）。 */
const NEW_ARTICLE_BUTTON: React.CSSProperties = {
  fontFamily: FONT_SANS,
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "0.06em",
  padding: "9px 20px",
  border: `1px solid ${JB.accent}`,
  background: JB.accent,
  color: "#fff",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

