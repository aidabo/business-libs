import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  EMPTY_AUDIO_INDEX,
  indexAudioEntries,
  trackOf,
  type NewsAudioEntry,
  type NewsPost as Post,
  type NowPlaying,
} from "../core";

// 読み上げの再生状態を、ページのどの部品からでも触れるようにする 1 か所。
//
// ── なぜ context ではなくモジュールの store か ─────────────────────────
// 固定ページ（/home/news）は面全体を 1 つの provider で包めた。Page Builder では
// 部品が 1 個ずつ別々に包まれるので、context では「第一面の ▶」と「下の帯」が
// 同じ 1 本を共有できない。鳴らす <audio> は 1 つでなければならないので、
// 状態はページに 1 つの store に置く。
//
// ── 一覧（entries）はどこから来るか ─────────────────────────────────
// `host-news-audio-public` に結び付けた部品（`audio` を受けた部品。ふつうは
// NewsAudioBar）が登録する。登録した物は記事の slug ごとに合わさるので、
// 複数の部品が同じ一覧を登録しても重ならない。無ければ「音声なし」。

export type NewsAudioApi = {
  enabled: boolean;
  /** 読み上げ（音声）が 1 本でもあるか。面ナビの「読み上げ」を出すか。 */
  hasVoice: boolean;
  /** 放送（映像）が 1 本でもあるか。面ナビの「バーチャル放送」を出すか。 */
  hasAvatar: boolean;
  now: NowPlaying | null;
  playing: boolean;
  voiceOf: (post: Post) => string | null;
  avatarOf: (post: Post) => string | null;
  isCurrent: (post: Post) => boolean;
  isPlaying: (post: Post) => boolean;
  toggle: (post: Post) => void;
  togglePlaying: () => void;
  stop: () => void;
  ended: () => void;
};

type AudioState = {
  entries: NewsAudioEntry[];
  index: ReturnType<typeof indexAudioEntries>;
  now: NowPlaying | null;
  playing: boolean;
};

let state: AudioState = { entries: [], index: EMPTY_AUDIO_INDEX, now: null, playing: false };
const listeners = new Set<() => void>();

const set = (next: Partial<AudioState>) => {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => state;

const entryKey = (entry: NewsAudioEntry) =>
  `${entry.slug}\n${entry.kind}\n${entry.avatar ? "avatar" : "primary"}\n${entry.url}`;

/** 一覧を足す。同じ物（slug・種類・URL が同じ）は 1 つにする。 */
export function registerAudioEntries(entries: NewsAudioEntry[] | null | undefined) {
  if (!Array.isArray(entries) || entries.length === 0) return;
  const seen = new Set(state.entries.map(entryKey));
  const added = entries.filter((entry) => entry && !seen.has(entryKey(entry)));
  if (added.length === 0) return;
  const merged = [...state.entries, ...added];
  set({ entries: merged, index: indexAudioEntries(merged) });
}

/** 試験用: store を空に戻す。 */
export function resetNewsAudio() {
  set({ entries: [], index: EMPTY_AUDIO_INDEX, now: null, playing: false });
}

/** `audio` を受けた部品が呼ぶ。描画のたびではなく、一覧が変わったときだけ足す。 */
export function useRegisterAudio(entries: NewsAudioEntry[] | null | undefined) {
  useEffect(() => {
    registerAudioEntries(entries);
  }, [entries]);
}

export function useNewsAudioCtx(): NewsAudioApi {
  const current = useSyncExternalStore(subscribe, snapshot, snapshot);
  return useMemo<NewsAudioApi>(() => {
    const { index, now, playing, entries } = current;
    return {
      enabled: entries.length > 0,
      hasVoice: entries.some((entry) => entry.kind === "voice"),
      hasAvatar: entries.some((entry) => entry.avatar === true),
      now,
      playing,
      voiceOf: (post) => trackOf(index, post)?.voice ?? null,
      avatarOf: (post) => trackOf(index, post)?.avatar ?? null,
      isCurrent: (post) => now !== null && now.id === post.id,
      isPlaying: (post) => playing && now !== null && now.id === post.id,
      // 同じ記事をもう一度押したら止める／続ける。別の記事なら差し替えて鳴らす。
      toggle: (post) => {
        const url = trackOf(state.index, post)?.voice ?? null;
        if (url === null) return;
        if (state.now !== null && state.now.id === post.id) {
          set({ playing: !state.playing });
          return;
        }
        set({ now: { id: post.id, title: post.title, url }, playing: true });
      },
      togglePlaying: () => set({ playing: state.now === null ? false : !state.playing }),
      stop: () => set({ now: null, playing: false }),
      ended: () => set({ playing: false }),
    };
  }, [current]);
}
