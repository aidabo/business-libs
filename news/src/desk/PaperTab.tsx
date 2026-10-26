"use client";

import { useMemo, useState } from "react";
import { articleArtifactsOf, indexArticleArtifacts, type ArticleReadArtifacts } from "../core";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import Panel from "./Panel";
import DayPicker from "./DayPicker";
import ScheduleTimeline from "./ScheduleTimeline";
import type { DziEditions } from "../core";
import PaperEditions from "./PaperEditions";
import { ArticleMeta, ArtifactIcons, DeskEmpty, DeskError, EditLink, StateChip } from "./parts";
import WriteDialog from "./WriteDialog";
import {
  FRONT_PAGE_LIMIT,
  countByState,
  dayLabel,
  faceLabelOfTag,
  faceOf,
  featuredOverflow,
  frontPageCandidates,
  groupByPaperDay,
  paperDayOfPost,
  replacedOf,
  stateOf,
  todayPaperDay,
  type DeskArticle,
  type DeskTag,
} from "./model";
import type { Desk } from "./useDesk";
import type { NewsJobRow } from "./useNewsJobs";
import type { NewsBroadcastSelection } from "../core";

// 棚を渡されていない（= まだ読んでいない）。0 面とは言わない（V1）。
const NOT_YET: DziEditions = { items: [], loading: true, available: false };

/**
 * 紙面タブ。**一覧全体を日で絞らない** — 全記事を紙面日で束ねてから、見ている日を選ぶ（spec §4.1）。
 * 面ごとに並べ、面の付いていない記事は最後にまとめる（面を付けてから公開するため）。
 *
 * 日の選択は**このタブの中の `DayPicker`**（ユーザー指示 2026-10-11）。電子紙面では
 * グローバルフィルタバーを出さない — 帯 1 本ぶん画面が広くなり、日の口は見ている日の
 * 一覧のすぐ上に来る。DayPicker はバーの中と**同じ 1 本**（見た目・操作が食い違わない）。
 *
 * **記事の絞り込み（状態・面・媒体・語・有無）はこのタブには掛けない**（同じ指示）。
 * バーの無いタブで絞りが効くと、映っていない条件で記事が消え、解除の口も無い。このタブの
 * 仕事は「その日の全記事に面を割る」ことなので、減るより全部出る方が正しい。EDITIONS・
 * 予約の帯・第一面の数は**日と絞りの外** — 紙面全体の話をしている（日を選ぶと消える警告は
 * 警告でなくなる）。
 *
 * ここは読みと選択と割付だけ。**記事を書く・公開する（予約も）は既存の `/editor`** へ送る
 * （行の「編集」）。机が持つのは面・媒体・主役・絵。
 *
 * 行には読み上げの印（🔊 音声・🎬 アバター放送）も出す — **記事タブと同じ `ArtifactIcons`
 * 1 本**（ユーザー指示 2026-10-07: 印を紙面タブにも）。印の元（`artifactJobs`）は机が
 * 1 回だけ読み、4 タブに配る（読者面と同じ軸。project で絞らない）。
 */
export default function PaperTab({ desk, canPublish, now, pickedDay, onPickDay, artifactJobs, artifactSelections, editions: shelf = NOT_YET }: { desk: Desk; canPublish: boolean; now: Date; pickedDay: string | null; onPickDay: (day: string | null) => void; artifactJobs: NewsJobRow[] | null; artifactSelections: NewsBroadcastSelection[]; /** 電子紙面の棚。読みは Console が 1 回だけ（タブの数にも使う）。省略は「まだ読んでいない」。 */ editions?: DziEditions }) {
  const days = useMemo(() => groupByPaperDay(desk.articles), [desk.articles]);
  const today = todayPaperDay(now);
  const [writing, setWriting] = useState<DeskArticle | null>(null);
  const [busy, setBusy] = useState(false);

  // 行の印（🔊 音声・🎬 アバター放送）の元。読みは机（Console）が 1 回だけ行う — 記事タブと
  // 同じ物（印は読者面と同じ軸。project で絞らない。理由は useNewsJobs.ts）。下の早い
  // return より前に置く（フックの順を描画ごとに揃える）。
  const artifacts = useMemo(() => indexArticleArtifacts(artifactJobs, null, artifactSelections), [artifactJobs, artifactSelections]);
  // 窓は route の上限（100 面）。**検索と絞り込みはこの窓の中で掛ける**（PaperEditions）—
  // 読者面の「配信中の紙面」（PaperPreview の 8 面）とは別の口。
  // desk モード: Ghost admin endpoint で全件（下書き含む）を取る。読みは Console（タブの数と共有）。
  const { items: editions, loading: dziLoading } = shelf;

  if (desk.status === "error") return <Panel title="電子紙面"><DeskError message={desk.error ?? ""} /></Panel>;
  // `idle` もここに入れる。機は `ready` でしか呼ばれないが、効果が走る前の 1 描画は `idle` のままなので、
  // 素通しすると「まだ読んでいない」が「この日の記事はまだありません」になる（V1）。
  if (desk.status !== "ready") return <Panel title="電子紙面"><DeskEmpty>読み込んでいます…</DeskEmpty></Panel>;

  const current = pickedDay ?? (days.some((d) => d.day === today) ? today : (days[0]?.day ?? ""));
  const day = days.find((d) => d.day === current);
  // **絞り込みは掛けない**（2026-10-11 ユーザー指示）。バーの無いこのタブで絞りが効くと、
  // 映っていない条件で記事が黙って消え、解除の口も無い。出すのはその日の全部 — このタブの
  // 仕事は「その日の全記事に面を割る」こと（理由は頭の docstring）。
  const visible = day?.articles ?? [];
  const counts = countByState(visible, now);
  // **第一面は日を跨ぐ。** 読者面の `selectFrontPage` は日を見ずに、公開されていて面の
  // 付いた記事（`frontPageCandidates`）から主役を新しい順に 6 本採る。ここを 1 日で
  // 閉じると、別の日の 7 本目が黙って落ちる。
  const candidates = frontPageCandidates(desk.articles);
  const overflow = featuredOverflow(candidates);
  const featuredCount = candidates.filter((a) => a.featured).length;

  const write = async (patch: Record<string, unknown>) => {
    if (!writing) return;
    setBusy(true);
    await desk.write(writing, patch);
    setBusy(false);
  };

  return (
    <Panel
      title="電子紙面"
      eyebrowText="PAPER"
      right={
        // **紙面全体の数**。この日の数ではない（第一面は日を跨ぐ）。この日ぶんは下の
        // 「公開／予約／下書き」の行が持つ。
        <div
          title="第一面に並ぶ主役の数（公開済み・面つきの記事だけを数えます）"
          style={{ fontFamily: FONT_SANS, fontSize: 12, color: JB.muted }}
        >
          第一面の主役 {featuredCount}／{FRONT_PAGE_LIMIT}
        </div>
      }
    >
      {/* 電子紙面の棚。読む（窓）はここ、絞る（検索・媒体・面・日）は PaperEditions の中。 */}
      {!dziLoading && editions.length > 0 && (
        <PaperEditions editions={editions} mediums={desk.mediums} tags={desk.tags} />
      )}

      <ScheduleTimeline articles={desk.articles} now={now} />

      {/* あふれの帯は**日の外**に置く。日に閉じると、この日に記事が無い日を選んだ瞬間に
          第一面の警告が消える（別の日の話をしているのだから、どの日を見ていても出る）。 */}
      {overflow.length > 0 && (
        <div role="alert" style={{ border: `1px solid ${JB.accent}`, padding: "10px 12px", marginBottom: 14, fontFamily: FONT_SANS, fontSize: 12.5, lineHeight: 1.9, color: JB.ink }}>
          第一面は {FRONT_PAGE_LIMIT} 本まで。次の主役は第一面に出ません:{" "}
          {overflow.map((a) => `「${a.title}」（${dayLabel(paperDayOfPost(a))}）`).join("")}
        </div>
      )}

      {/* 日の口。電子紙面ではバーを出さないので、日はここで選ぶ（バーの中と
          同じ DayPicker 1 本 — 2026-10-11 ユーザー指示）。 */}
      <div style={{ marginBottom: 12 }}>
        <DayPicker pickedDay={pickedDay} onPickDay={onPickDay} articles={desk.articles} now={now} />
      </div>

      {!day ? (
        <DeskEmpty>この日の記事はまだありません。</DeskEmpty>
      ) : (
        <>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: JB.muted, marginBottom: 12 }}>
            公開 {counts.published}／予約 {counts.scheduled}／下書き {counts.draft}
            {counts.overdue > 0 && (
              <strong style={{ color: JB.accent }}>　予約の時刻を過ぎています {counts.overdue}</strong>
            )}
          </div>

          {desk.faces.map((face) => {
            const rows = visible.filter((a) => faceOf(a)?.label === face.label);
            if (rows.length === 0) return null;
            return (
              <section key={face.slug} style={{ borderTop: `1px solid ${JB.line}`, paddingTop: 12, marginTop: 12 }}>
                <h3 style={{ fontFamily: FONT_SERIF, fontSize: 15, margin: "0 0 8px" }}>{face.label} <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: JB.muted, fontWeight: 400 }}>({rows.length})</span></h3>
                {rows.map((article) => (
                  <ArticleRow key={article.id} article={article} read={articleArtifactsOf(artifacts, article.slug)} mediums={desk.mediums} now={now} canPublish={canPublish} onPick={() => setWriting(article)} />
                ))}
              </section>
            );
          })}

          {visible.some((a) => a.tags.every((t) => faceLabelOfTag(t) === null)) && (
            <section style={{ borderTop: `1px solid ${JB.line}`, paddingTop: 12, marginTop: 12 }}>
              <h3 style={{ fontFamily: FONT_SERIF, fontSize: 15, margin: "0 0 8px" }}>面が付いていない</h3>
              {visible
                .filter((a) => a.tags.every((t) => faceLabelOfTag(t) === null))
                .map((article) => (
                  <ArticleRow key={article.id} article={article} read={articleArtifactsOf(artifacts, article.slug)} mediums={desk.mediums} now={now} canPublish={canPublish} onPick={() => setWriting(article)} />
                ))}
            </section>
          )}
        </>
      )}

      {writing && (
        <WriteDialog
          article={writing}
          faces={desk.faces}
          mediums={desk.mediums}
          siblings={candidates}
          canPublish={canPublish}
          busy={busy}
          onClose={() => setWriting(null)}
          onWrite={write}
        />
      )}
    </Panel>
  );
}

function ArticleRow({
  article,
  read,
  mediums,
  now,
  canPublish,
  onPick,
}: {
  article: DeskArticle;
  read: ArticleReadArtifacts | null;
  mediums: DeskTag[];
  now: Date;
  canPublish: boolean;
  onPick: () => void;
}) {
  const state = stateOf(article, now);
  return (
    // 2 段の行。**1 段目は題と押し口、2 段目は素性（面・媒体・紙面日）** — 携帯の幅で
    // 折り返しても、印と題と押し口が混ざらない（ユーザー指示 2026-10-07）。
    <div style={{ padding: "8px 0", borderBottom: `1px solid ${JB.line}` }}>
      <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
        <StateChip state={state} at={article.published_at} />
        {article.featured && <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: JB.ink }}>主役</span>}
        <span style={{ flex: 1, minWidth: 200, fontFamily: FONT_SANS, fontSize: 13.5, color: JB.ink }}>
          {article.title}
        </span>
        {/* 印は記事タブと同じ `ArtifactIcons` 1 本（ユーザー指示 2026-10-07）。 */}
        <ArtifactIcons read={read} />
        <EditLink postId={article.id} />
        <button
          type="button"
          disabled={!canPublish}
          onClick={onPick}
          title="面・媒体・主役・絵を決める"
          style={{
            fontFamily: FONT_SANS,
            fontSize: 12,
            border: `1px solid ${JB.line}`,
            background: "transparent",
            padding: "3px 10px",
            cursor: canPublish ? "pointer" : "not-allowed",
            opacity: canPublish ? 1 : 0.45,
            whiteSpace: "nowrap",
          }}
        >
          割付
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap", marginTop: 5 }}>
        <ArticleMeta article={article} mediums={mediums} />
        {replacedOf(article, now) && (
          <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: JB.muted }}>差し替え</span>
        )}
      </div>
    </div>
  );
}
