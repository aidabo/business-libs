"use client";

import { useMemo, useState } from "react";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import { usePaperSettings } from "../shared/PaperSettingsContext";
import Panel from "./Panel";
import { ConfirmSheet, DeskEmpty, DeskError } from "./parts";
import {
  MARK_LABEL,
  faceTagNameOf,
  markPlan,
  newTagPlan,
  renamePlan,
  tagMarkOf,
  type DeskTag,
  type NewTagDraft,
  type TagMark,
} from "./model";
import type { Desk } from "./useDesk";

/**
 * 開いている確認の 1 枚。**1 つだけ持つ**（別々の真偽値にすると 2 枚重なりうる）。
 * `create` は「足す」、`mark` は印の付け替え、`rename` は改名。
 */
type Sheet =
  | { kind: "create" }
  | { kind: "mark"; tag: DeskTag; want: "medium" | "face" }
  | { kind: "rename"; tag: DeskTag; name: string };

/**
 * 媒体と紙面のタブ。**タグをそのまま一覧して、1 本ずつ印を付ける**。
 *
 * 媒体も紙面も Ghost のタグ 1 本で持ち、区別は `classification` 列の値だけ
 * （別テーブルは作らないと 2026-10-03 に決めた）。だからこの画面は**タグの管理画面**で、
 * 名前・slug・可視性は Ghost のタグ画面と同じ物を映している。
 *
 * 面（紙面）のタグは**名前が `#◯◯面` であること**が要る。読者面が面を見つけるのは
 * 名前の形であって印ではない（`faceLabelOfTag`）ので、印だけ付けても読者面には出ない。
 * 一覧でそこを確かめられるように、名前がその形でない面タグには断り書きを出す。
 *
 * **書けるのは管理者・owner・編集者（Super Editor）だけ**（ユーザー指示 2026-10-03
 * 「タグはシステム全体向けなので」— 機は `view.role === "admin"` を渡す）。
 * それ以外には一覧を出すだけで、押せる物を出さない（押せないボタンを並べない）。
 */
export default function MediumsTab({ desk, canManage }: { desk: Desk; canManage: boolean }) {
  const paper = usePaperSettings();
  const [word, setWord] = useState("");
  const [markedOnly, setMarkedOnly] = useState(false);
  const [draft, setDraft] = useState<NewTagDraft>({ kind: "medium", name: "", typedSlug: "", description: "" });
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [busy, setBusy] = useState(false);

  const plan = useMemo(() => newTagPlan(draft), [draft]);

  const shown = useMemo(() => {
    const needle = word.trim().toLowerCase();
    // 並びは 媒体 → 紙面 → その他の印 → 印なし（ユーザー指示 2026-10-15: 媒体を一番上に）。
    const MARK_ORDER: Record<string, number> = { medium: 0, face: 1, other: 2, none: 3 };
    return desk.tags
      .filter((tag) => {
        if (markedOnly && tagMarkOf(tag) === "none") return false;
        if (!needle) return true;
        return `${tag.name} ${tag.slug}`.toLowerCase().includes(needle);
      })
      .sort((a, b) => {
        const diff = (MARK_ORDER[tagMarkOf(a)] ?? 3) - (MARK_ORDER[tagMarkOf(b)] ?? 3);
        return diff !== 0 ? diff : a.name.localeCompare(b.name, "ja");
      });
  }, [desk.tags, markedOnly, word]);

  const counts = useMemo(() => {
    const tally = { none: 0, medium: 0, face: 0, other: 0 } as Record<TagMark, number>;
    for (const tag of desk.tags) tally[tagMarkOf(tag)] += 1;
    return tally;
  }, [desk.tags]);

  /**
   * 開いている 1 枚。**3 つを別々の `ConfirmSheet` にしない** — `sheet` は 1 つしか
   * 持てないので、2 枚重なることがない。
   */
  const sheetView = (() => {
    if (!sheet) return null;

    if (sheet.kind === "create") {
      return (
        <ConfirmSheet
          open
          title={draft.kind === "face" ? "紙面（面）を足す" : "媒体を足す"}
          lines={plan.lines}
          okLabel="足す"
          busy={busy}
          onOk={async () => {
            setBusy(true);
            const ok = await desk.createTag(draft);
            setBusy(false);
            // **成否によらず閉じる。** 幕は zIndex 80 で一覧の上に乗るので、失敗したときに
            // 開いたままにすると、理由を出す帯（`DeskWriteError`）が幕の陰で読めない。
            // 素材タブ・割付の 1 枚も同じ形（成否によらず閉じる）。
            setSheet(null);
            if (ok) setDraft({ kind: draft.kind, name: "", typedSlug: "", description: "" });
          }}
          onCancel={() => setSheet(null)}
        />
      );
    }

    if (sheet.kind === "mark") {
      return (
        <ConfirmSheet
          open
          title={`「${sheet.tag.name}」の印を${MARK_LABEL[sheet.want]}にする`}
          lines={markPlan(sheet.tag, sheet.want)}
          okLabel={`${MARK_LABEL[sheet.want]}にする`}
          busy={busy}
          onOk={async () => {
            if (!sheet.tag.id) return;
            setBusy(true);
            await desk.setTagMark(sheet.tag.id, sheet.want);
            setBusy(false);
            setSheet(null);
          }}
          onCancel={() => setSheet(null)}
        />
      );
    }

    // 改名。**文は打つそばから変わる**（`children` の入力欄を `lines` と同じ描画で組む）。
    const renamed = renamePlan(sheet.tag, sheet.name);
    return (
      <ConfirmSheet
        open
        title={`「${sheet.tag.name}」の名前を変える`}
        lines={renamed.lines}
        okLabel="名前を変える"
        busy={busy}
        // 変える名前が無い（空・同じ）ときは押させない。**下の `onOk` の番人と同じ条件** —
        // 片方だけ直すと、押せるのに何も起きないボタンに戻る。
        blocked={!renamed.ok}
        onOk={async () => {
          if (!sheet.tag.id || !renamed.ok) return;
          setBusy(true);
          await desk.updateTag(sheet.tag.id, { name: renamed.name });
          setBusy(false);
          setSheet(null);
        }}
        onCancel={() => setSheet(null)}
      >
        <input
          value={sheet.name}
          onChange={(e) => setSheet({ ...sheet, name: e.target.value })}
          autoFocus
          aria-label="新しい名前"
          style={{ ...inputStyle, width: "100%" }}
        />
      </ConfirmSheet>
    );
  })();

  return (
    <Panel
      title="媒体と紙面"
      eyebrowText="MEDIUMS & FACES"
      right={
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: JB.muted }}>
          媒体 {counts.medium}・紙面 {counts.face}
        </div>
      }
    >
      {/* 誰が変えられるか（ユーザー指示 2026-10-14）。全員に出す — 管理者には案内、それ以外には
          ボタンが無い理由。門は `canManage`（= role.ts の ADMIN_ROLES: Owner・Administrator・Super Editor）。 */}
      <p
        role="note"
        style={{ fontFamily: FONT_SANS, fontSize: 12.5, lineHeight: 1.8, color: JB.ink, background: "#fbecec", borderLeft: `3px solid ${JB.accent}`, padding: "8px 12px", margin: "0 0 12px" }}
      >
        媒体・紙面の追加と変更（印の付け替え・改名）は Super Editor・Administrator・Owner だけができます。
        Editor・Author・Contributor は見るだけです。
      </p>

      <div style={{ fontFamily: FONT_SANS, fontSize: 12.5, lineHeight: 1.9, color: JB.muted, marginBottom: 12 }}>
        <strong style={{ color: JB.ink }}>媒体も紙面もタグです</strong>（別のテーブルはありません）。
        媒体は <code>classification: medium</code>、紙面は <code>classification: face</code> の印で見分けます。
        タグは<strong style={{ color: JB.ink }}>システム全体</strong>のものなので、ここで足したタグは
        他の画面のタグ一覧にも出ます。
        <br />
        印を<strong style={{ color: JB.ink }}>外す</strong>口はありません。Ghost のタグ画面にもこの欄は無く
        （確かめました）、机も媒体と紙面の 2 つしか送らないためです。だから机の外で付いた別の印は、
        置き換えると<strong style={{ color: JB.ink }}>戻せません</strong> — 置き換えるときは確認の 1 枚を挟みます。
        <br />
        題字はこのタグを読んでいません — 紙面の題字は <code>{paper.paperName}</code>、版号は {paper.editionBaseDate} を第{" "}
        {paper.editionBaseNumber.toLocaleString("en-US")} 号として 1 日 1 号ずつ数えます（環境変数で変えられます。休刊日はまだ数えません）。媒体を足しても題字は変わりません。
      </div>

      {/* 足す口は説明のすぐ下・一覧の前に置く（ユーザー指示 2026-10-14: 長い一覧の一番下にあり、
          消えたと思われた）。中身と確認の 1 枚は変えない。 */}
      {canManage && (
        <section
          aria-label="タグを足す"
          style={{ border: `1px solid ${JB.accent}`, background: JB.white, padding: "12px 14px", marginBottom: 16 }}
        >
          <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: JB.accent, marginBottom: 8 }}>
            タグを足す（媒体・紙面）
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ fontFamily: FONT_SANS, fontSize: 12.5 }}>
              種別
              <select
                value={draft.kind}
                onChange={(e) => setDraft({ ...draft, kind: e.target.value === "face" ? "face" : "medium" })}
                style={{ marginLeft: 6, padding: "6px 8px", border: `1px solid ${JB.line}`, background: JB.white, fontFamily: FONT_SANS, fontSize: 12.5 }}
              >
                <option value="medium">媒体</option>
                <option value="face">紙面（面）</option>
              </select>
            </label>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder={draft.kind === "face" ? "面の名前（例: 社会）" : "名前（例: 火星日報）"}
              style={inputStyle}
            />
            <input
              value={draft.typedSlug}
              onChange={(e) => setDraft({ ...draft, typedSlug: e.target.value })}
              placeholder="slug の語（例: mars-times）"
              style={inputStyle}
            />
            <input
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="説明（任意）"
              style={{ ...inputStyle, width: 220 }}
            />
            <button
              type="button"
              disabled={!plan.ok}
              onClick={() => setSheet({ kind: "create" })}
              style={{ fontFamily: FONT_SANS, fontSize: 12.5, border: `1px solid ${JB.accent}`, background: JB.accent, color: JB.paper, padding: "7px 14px", opacity: plan.ok ? 1 : 0.45, cursor: plan.ok ? "pointer" : "not-allowed" }}
            >
              確認へ
            </button>
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: JB.muted, marginTop: 6, lineHeight: 1.8 }}>
            面は名前の形が要ります。<code>社会</code> と打つと <code>#社会面</code> のタグを作ります —
            読者面はこの形の名前で面を見つけています。最初の 1 本は題字の英語名（{paper.paperNameEn}）から語を採ると揃います。
          </div>
        </section>
      )}


      {/* `error` を先に受ける。`!== "ready"` を先に置くと、失敗が「読み込んでいます」に化ける。 */}
      {desk.status === "error" ? (
        <DeskError message={desk.error ?? ""} />
      ) : desk.status !== "ready" ? (
        <DeskEmpty>タグを読み込んでいます…</DeskEmpty>
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap", marginBottom: 10 }}>
            <label style={{ fontFamily: FONT_SANS, fontSize: 12.5 }}>
              語
              <input
                type="search"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="名前・slug"
                style={{ marginLeft: 6, padding: "5px 8px", border: `1px solid ${JB.line}`, fontFamily: FONT_SANS, fontSize: 12.5, width: 180 }}
              />
            </label>
            <label style={{ fontFamily: FONT_SANS, fontSize: 12.5, display: "flex", gap: 6, alignItems: "center" }}>
              <input type="checkbox" checked={markedOnly} onChange={(e) => setMarkedOnly(e.target.checked)} />
              印の付いたタグだけ
            </label>
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: JB.muted }}>
              {shown.length}／{desk.tags.length} 本
              {counts.other > 0 && `　その他の印 ${counts.other} 本（置き換えると戻せません）`}
            </span>
          </div>

          {shown.length === 0 ? (
            <DeskEmpty>
              {desk.tags.length === 0 ? "タグはまだありません。" : "この絞り込みに合うタグはありません。"}
            </DeskEmpty>
          ) : (
            shown.map((tag) => (
              <TagRow key={tag.id ?? tag.slug} tag={tag} canManage={canManage} desk={desk} onOpen={setSheet} />
            ))
          )}
        </>
      )}

      {sheetView}
    </Panel>
  );
}

/** タグ 1 行。**印を付けるのは 3 つのボタン。押した瞬間に送るか、1 枚挟むかは印で変わる。** */
function TagRow({
  tag,
  canManage,
  desk,
  onOpen,
}: {
  tag: DeskTag;
  canManage: boolean;
  desk: Desk;
  onOpen: (sheet: Sheet) => void;
}) {
  const mark = tagMarkOf(tag);
  const faceNameWrong = mark === "face" && faceTagNameOf(tag.name) !== tag.name;

  return (
    <div style={{ borderTop: `1px solid ${JB.line}`, padding: "9px 0" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
        <span style={{ fontFamily: FONT_SERIF, fontSize: 14.5 }}>{tag.name}</span>
        <code style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: JB.muted }}>{tag.slug}</code>
        <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: JB.muted }}>
          {tag.visibility ?? "（可視性不明）"}
        </span>

        {canManage ? (
          <span style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
            {(["medium", "face"] as const).map((want) => {
              const on = mark === want;
              return (
                <button
                  key={want}
                  type="button"
                  aria-pressed={on}
                  title={on ? "いまこの印です" : `このタグを${MARK_LABEL[want]}にする`}
                  onClick={() => {
                    // **id が無い行では押させない。** 通すと `/tags//` を叩く
                    // （Ghost は必ず id を返すので現実には来ないが、塞いでおく）。
                    if (!tag.id || on) return;
                    // **「その他」の印は 1 クリックで消さない。** 機の外で付いた印
                    // （実データに `AI事業` がある）は戻す口が無いので、名指しして確かめる。
                    // 送る値は `markPlan` が出したのと同じ（見せた値と送る値を分けない）。
                    if (mark === "other") {
                      onOpen({ kind: "mark", tag, want });
                      return;
                    }
                    void desk.setTagMark(tag.id, want);
                  }}
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    padding: "3px 10px",
                    // 「紙面」「媒体」の印は朱（ユーザー指示 2026-10-14）。いまの印は塗り、もう一方は朱の枠と字。
                    border: `1px solid ${JB.accent}`,
                    background: on ? JB.accent : "transparent",
                    color: on ? JB.paper : JB.accent,
                    cursor: !tag.id || on ? "default" : "pointer",
                    opacity: tag.id ? 1 : 0.45,
                  }}
                >
                  {MARK_LABEL[want]}
                </button>
              );
            })}
            <button
              type="button"
              title="名前を変える（slug は変わりません）"
              onClick={() => {
                if (!tag.id) return;
                // `window.prompt` は使わない。何がどう変わるかを打つ前に出せず、
                // 面タグの形が崩れる警告も**壊れた後**にしか出せない（`renamePlan`）。
                onOpen({ kind: "rename", tag, name: tag.name });
              }}
              style={{ fontFamily: FONT_SANS, fontSize: 12, padding: "3px 10px", border: `1px solid ${JB.line}`, background: "transparent", color: JB.ink, cursor: tag.id ? "pointer" : "not-allowed", opacity: tag.id ? 1 : 0.45 }}
            >
              改名
            </button>
          </span>
        ) : (
          <span
            style={
              mark === "medium" || mark === "face"
                ? // 「紙面」「媒体」の印は朱の枠で（ユーザー指示 2026-10-14）。「その他」「—」は淡いまま。
                  { marginLeft: "auto", fontFamily: FONT_SANS, fontSize: 11.5, color: JB.accent, border: `1px solid ${JB.accent}`, padding: "1px 8px", fontWeight: 600 }
                : { marginLeft: "auto", fontFamily: FONT_SANS, fontSize: 11.5, color: JB.muted }
            }
          >
            {MARK_LABEL[mark]}
            {mark === "other" && tag.classification ? `（${tag.classification}）` : ""}
          </span>
        )}
      </div>

      {faceNameWrong && (
        <div style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: JB.accent, marginTop: 4, lineHeight: 1.8 }}>
          印は紙面ですが、名前が <code>#◯◯面</code> の形ではありません。読者面は名前の形で面を見つけるので、
          このままでは<strong>どの面にも出ません</strong>。「改名」で <code>{faceTagNameOf(tag.name)}</code> に直してください。
        </div>
      )}
      {mark === "other" && canManage && (
        <div style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: JB.muted, marginTop: 4 }}>
          このタグの印は「{tag.classification}」です（机の外で付いた物）。
          「媒体」か「紙面」を押すと置き換わり、<strong>元の「{tag.classification}」には戻せません</strong>
          （Ghost のタグ画面にもこの欄が無いため）。押すと確認の 1 枚が出ます。
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "6px 8px",
  border: `1px solid ${JB.line}`,
  fontFamily: FONT_SANS,
  fontSize: 12.5,
};
