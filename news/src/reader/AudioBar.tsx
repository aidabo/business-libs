"use client";

import { useEffect, useRef, useState } from "react";
import { FONT_SANS, JB } from "../core";
import { mmss } from "../core";
import { useNewsAudioCtx } from "../shared/NewsAudioContext";

// 画面の下に貼り付く読み上げの帯。鳴っている間だけ出る。
//
// ── なぜ画面を分けないか ──────────────────────────────────────────
// 記事を読むのを止めてまで音声の画面へ行かせない。読みながら聞くものなので、
// 紙面を隠さない位置（下）に細く置き、閉じられるようにする。
//
// ── なぜ 1 つの <audio> か ────────────────────────────────────────
// 記事ごとに <audio> を持つと、次を押したときに前が鳴り続ける。要素はこの 1 つで、
// src を差し替える。
//
// 音声は別の配信元（CloudFront）から来るが、メディアの再生に CORS は要らない
// （一覧の JSON だけが許可制で、それはサーバーが読んでいる）。
export default function AudioBar() {
  const { now, playing, togglePlaying, stop, ended } = useNewsAudioCtx();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 差し替えた瞬間に前の曲の位置が残らないようにする。
  useEffect(() => {
    setTime(0);
    setDuration(0);
    const el = audioRef.current;
    if (el) el.currentTime = 0;
  }, [now?.url]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || now === null) return;
    if (playing) {
      // 押されてから鳴らすので、自動再生の制限には掛からない。それでも
      // 端末側で断られることはあるので、断られたら鳴っていない状態に戻す。
      el.play().catch(() => ended());
    } else {
      el.pause();
    }
  }, [playing, now, ended]);

  if (now === null) return null;

  const seek = (value: number) => {
    const el = audioRef.current;
    setTime(value);
    if (el) el.currentTime = value;
  };

  return (
    <div className="jb-audiobar" role="region" aria-label="読み上げ">
      <div className="jb-wrap jb-audiobar-inner">
        <audio
          ref={audioRef}
          src={now.url}
          preload="metadata"
          onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
          onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
          onEnded={ended}
        />

        <button
          type="button"
          className="jb-audiobar-btn"
          onClick={togglePlaying}
          aria-label={playing ? "一時停止" : "再生"}
        >
          <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
        </button>

        <span className="jb-audiobar-body">
          {/*
            「自動音声」と書く。読み手は合成音声で、アナウンサーではない。
            題字の下の断り書きと同じで、聞き手に先に言っておくほうがよい。
          */}
          <span className="jb-audiobar-label">読み上げ（自動音声）</span>
          <span className="jb-audiobar-title">{now.title}</span>
        </span>

        <input
          type="range"
          className="jb-audiobar-seek"
          min={0}
          max={Math.max(duration, 0)}
          step={1}
          value={Math.min(time, Math.max(duration, 0))}
          onChange={(event) => seek(Number(event.target.value))}
          aria-label="再生位置"
        />

        <span className="jb-audiobar-time" style={{ fontFamily: FONT_SANS, color: JB.muted }}>
          {mmss(time)} / {mmss(duration)}
        </span>

        <button type="button" className="jb-audiobar-close" onClick={stop} aria-label="読み上げを閉じる">
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </div>
  );
}
