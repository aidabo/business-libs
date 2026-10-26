"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReadJob } from "../core";
import type { NewsBroadcastSelection } from "../core";
import { jobsUnavailableNote, rowsOf } from "./model";
import { NEWS_JOBS_URL, PROJECTS_URL, getJson } from "./api";

/** 一度に読むジョブの数。**切る数は 1 か所に置く**（タブごとに違うと片方だけ痩せる）。 */
export const JOB_LIMIT = 50;

/** ジョブの状態の呼び名。未知の状態は生の値をそのまま出す（黙って「不明」にしない）。 */
export const STATUS_LABEL: Record<string, string> = {
  queued: "待機中",
  pending: "待機中",
  running: "実行中",
  completed: "完了",
  failed: "失敗",
};

/** 一覧に出す 1 行。`ReadJob` は突き合わせに要る欄しか持たないので、表示に要る欄を足す。 */
export type NewsJobRow = ReadJob & { id?: string; status?: string; created_at?: string };

export type NewsJobs = {
  /** `null` は「まだ読んでいない」。`[]` と混ぜない（読み込み前の 1 描画で「まだありません」と言わない）。 */
  projects: { id: string; name: string }[] | null;
  projectId: string;
  setProjectId: (id: string) => void;
  jobs: NewsJobRow[] | null;
  /** **読みの失敗だけ。** 積む失敗は呼び側が別に持つ（帯の意味が違う）。 */
  error: string | null;
  /** 履歴が読めなかったときの断り書き。**失敗ではない**ので error と別に持つ。 */
  note: string | null;
  reloadJobs: () => void;
};

/**
 * news のジョブ一覧とプロジェクト一覧を読む**唯一の口**。
 *
 * 読み上げタブとアバタータブは同じジョブを別の角度から見る（読み上げは記事ごとの
 * 音声・映像の印、アバターは生成物そのもの）。読みをタブごとに書くと、片方だけ
 * 直したときに「読み上げタブには出るがアバタータブには出ない」ズレができる。
 *
 * 積む側（`ReadTab` の createJob）はここに無い — あちらは記事を選ぶという別の仕事を
 * 持つので、読みだけを共有する。
 */
const PROJECT_ID_KEY = "jb-console-project-id";

export default function useNewsJobs(): NewsJobs {
  const [projectId, setProjectId] = useState<string>(() => {
    try {
      return localStorage.getItem(PROJECT_ID_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [projects, setProjects] = useState<{ id: string; name: string }[] | null>(null);
  const [jobs, setJobs] = useState<NewsJobRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const loadJobs = useCallback(async (id: string) => {
    if (!id) {
      // プロジェクトが無い（まだ読んでいる最中か、1 つも無い）。**前の断り書きをここで消す** —
      // 残すと、さっき失敗した別のプロジェクトの話を、いまの画面の話として出し続ける。
      //
      // ジョブは 0 件で出す。**「このプロジェクトに無い」と読ませないこと**は呼び側の
      // 仕事（`projectId` を見て文を選ぶ）— ここで文を決めると 2 つのタブの語が揃わない。
      setJobs([]);
      setNote(null);
      return;
    }
    setJobs(null);
    setNote(null);
    try {
      const payload = await getJson(`${NEWS_JOBS_URL}?limit=${JOB_LIMIT}&project_id=${encodeURIComponent(id)}`);
      setJobs(rowsOf(payload, "socialainewsjobs", "jobs") as NewsJobRow[]);
    } catch (e) {
      // 履歴が読めないのは**机の失敗ではない**。印が出ないだけで、原稿は積める。
      // ここで error を出すとタブ全体が「取れなかった」に見える（NewsAgentSettingsPanel
      // も同じ場面で error を出さない）。
      setJobs([]);
      setNote(jobsUnavailableNote(e instanceof Error ? e.message : ""));
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const payload = await getJson(PROJECTS_URL);
      const rows = rowsOf(payload, "socialaiprojects", "projects");
      const list = rows
        .map((row) => {
          const record = row as Record<string, unknown>;
          const id = typeof record?.id === "string" ? record.id : "";
          const name = typeof record?.name === "string" ? record.name : id;
          return id ? { id, name } : null;
        })
        .filter((row): row is { id: string; name: string } => row !== null);
      setProjects(list);
      if (list.length > 0) setProjectId((current) => current || list[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "プロジェクトを取れませんでした");
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (projectId) {
      try { localStorage.setItem(PROJECT_ID_KEY, projectId); } catch { /* blocked */ }
    }
  }, [projectId]);

  useEffect(() => {
    void loadJobs(projectId);
  }, [loadJobs, projectId]);

  return {
    projects,
    projectId,
    setProjectId,
    jobs,
    error,
    note,
    reloadJobs: () => {
      void loadJobs(projectId);
    },
  };
}

/**
 * 記事タブの**読み上げの印**（🔊 音声・🎬 アバター）用のジョブ読み。読みだけ・絞りなし。
 *
 * ── なぜ useNewsJobs と別に読むか ────────────────────────────────
 * あちらは机が選んだプロジェクトの一覧を出すための物（面ごとに絞る）。記事の行の印は
 * それとは別の物差し — **読者面と同じ軸**で読む（project では絞らない）。印は
 * 「読者が実際に押して開けるか」を映すので、机が別のプロジェクトを選んだ日も記事の行の
 * 印は読者面と一致していなければならない（newsReadIndex.ts の「軸が 1 つ違う（未決）」
 * — ここは読者面側に合わせる）。
 *
 * 読めなくても失敗にしない（`jobs: []` と note）。印が出ないだけで、記事は今までどおり
 * 扱える — useNewsJobs と同じ扱い（`jobsUnavailableNote`）。
 *
 * `jobs === null` は「まだ読んでいない」。`[]` と混ぜない（読み込み前の 1 描画で
 * 印が「無い」と確定させない）。
 */
export function useArticleArtifactJobs(): { jobs: NewsJobRow[] | null; note: string | null; selections: NewsBroadcastSelection[] } {
  const [jobs, setJobs] = useState<NewsJobRow[] | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [selections, setSelections] = useState<NewsBroadcastSelection[]>([]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        // `order` を省かない: 索引の「最初に当たった物が勝つ」は新しい順に依存している
        // （口の既定と同じ値だが、既定が変わった日に黙って変わらないよう名指しする）。
        const payload = await getJson(
          `${NEWS_JOBS_URL}?limit=${JOB_LIMIT}&type=news-read&order=${encodeURIComponent("created_at desc")}`,
        );
        if (!alive) return;
        const rows = rowsOf(payload, "socialainewsjobs", "jobs") as NewsJobRow[];
        setJobs(rows);
        const postIds = [...new Set(rows.flatMap((job) =>
          (job.items ?? []).map((item) => String(item.post_id || "").trim()),
        ).filter((id) => /^[a-f0-9]{24}$/i.test(id)))];
        if (postIds.length > 0) {
          try {
            const selectionPayload = await getJson(
              `/ghost/api/admin/internal/social/ai/news/broadcast-selections/?post_ids=${encodeURIComponent(postIds.join(","))}`,
            );
            if (!alive) return;
            setSelections(rowsOf(selectionPayload, "selections", "socialainewsbroadcastselections") as NewsBroadcastSelection[]);
          } catch {
            // The job list remains useful if the optional selection lookup is unavailable.
            setSelections([]);
          }
        } else {
          setSelections([]);
        }
      } catch (e) {
        if (!alive) return;
        setJobs([]);
        setSelections([]);
        setNote(jobsUnavailableNote(e instanceof Error ? e.message : ""));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { jobs, note, selections };
}
