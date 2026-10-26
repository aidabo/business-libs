"use client";

import { useEffect, useRef, useState } from "react";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import { usePaperSettings } from "../shared/PaperSettingsContext";
import { BOT_NAME, MAX_QUESTION_CHARS, MAX_TURNS, STARTER_QUESTIONS, type AskTurn } from "../core";
import { IMPRINT } from "./content";
import { useNews, useViewerKind, type NewsMemberMode } from "../adapter/NewsContext";
import type { NewsPresenter } from "../core";
import { useArticleLinker } from "../shared/NewsLink";

type Source = { post_id: string; title: string };

type Message = AskTurn & { sources?: Source[]; failed?: boolean };

// 記事に聞く — 会員向けの会話ボット「タイムズくん」（企画: docs/planning/janabiz-news-ask-bot-plan.md）。
//
// 会話はこの画面の state だけに持つ（サーバーには保存しない。閉じれば消える）。
// 毎回、直近の発言を POST /ghost/api/admin/internal/news/ask/（本体 /api/news/ask）に送り、1 回分の答えを受け取る。
// 会員でない人には会話の欄を出さず、その場の会員ダイアログへ誘う。門は口（401）の側にもある。
export default function AskPanel({
  presenters = [],
  askGuest = IMPRINT.askGuest,
}: {
  presenters?: NewsPresenter[];
  /** 会員でない人への案内（会話欄の代わり）。 */
  askGuest?: string;
}) {
  const viewer = useViewerKind();
  const { MemberDialog, urls } = useNews().adapter;
  const linkOf = useArticleLinker();
  // 口はホストが渡す（管理 cookie が /ghost に張られるホストでは /ghost の下の口）。
  const askUrl = urls?.ask ?? null;
  const { paperName } = usePaperSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState(false);
  const [join, setJoin] = useState<NewsMemberMode | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  const asked = messages.filter((message) => message.role === "user").length;
  const full = asked >= MAX_TURNS;

  // 新しい発言が増えたら、会話の欄の中だけを一番下へ送る（ページ全体は動かさない）。
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, busy]);

  async function ask(text: string) {
    const q = text.trim().slice(0, MAX_QUESTION_CHARS);
    if (!q || busy || full || !askUrl) return;

    const history: Message[] = [...messages, { role: "user", content: q }];
    setMessages(history);
    setQuery("");
    setBusy(true);

    try {
      const res = await fetch(askUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 失敗した答えは会話に入れない（AI に「答えられませんでした」を前の話題として読ませない）。
          messages: history.filter((m) => !m.failed).map(({ role, content }) => ({ role, content })),
        }),
      });
      if (res.status === 401) {
        setLocked(true);
        setMessages([]);
        return;
      }
      if (!res.ok) throw new Error(`ask ${res.status}`);
      const json = await res.json();
      const answer = typeof json?.answer === "string" ? json.answer.trim() : "";
      if (!answer) throw new Error("empty answer");
      setMessages([
        ...history,
        { role: "assistant", content: answer, sources: Array.isArray(json?.sources) ? json.sources : [] },
      ]);
    } catch {
      setMessages([
        ...history,
        { role: "assistant", content: "いまは答えられませんでした。時間をおいて試してください。", failed: true },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const guest = viewer === "guest" || locked;

  return (
    <section id="ask" className="jb-news-section">
      <div className="jb-face-head" style={{ marginBottom: "clamp(12px, 1.6vw, 18px)" }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 700, margin: 0, color: JB.ink }}>
          記事に聞く
        </h2>
        <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: JB.muted }}>AI・{BOT_NAME}</span>
      </div>

      {viewer === "unknown" && !locked ? null : guest ? (
        <div className="jb-ask-guest">
          <p style={{ fontFamily: FONT_SANS, fontSize: 15, lineHeight: 1.9, color: JB.ink, margin: 0 }}>
            {askGuest}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
            <button type="button" className="jb-btn jb-btn-dark jb-ask-send" onClick={() => setJoin("signup")}>
              会員登録
            </button>
            <button type="button" className="jb-btn jb-ask-starter" onClick={() => setJoin("signin")}>
              ログイン
            </button>
          </div>
        </div>
      ) : (
        <>
          <div ref={logRef} className="jb-ask-log" aria-live="polite">
            <p className="jb-ask-msg jb-ask-bot">
              こんにちは、{BOT_NAME}です。{paperName}の記事について、何でも聞いてください。
            </p>
            {messages.map((message, index) =>
              message.role === "user" ? (
                <p key={index} className="jb-ask-msg jb-ask-user">
                  {message.content}
                </p>
              ) : (
                <div key={index} className="jb-ask-msg jb-ask-bot" data-failed={message.failed ? "true" : undefined}>
                  <p style={{ margin: 0 }}>{message.content}</p>
                  {message.sources && message.sources.length > 0 && (
                    <ol className="jb-ask-sources">
                      {message.sources.map((source, n) => (
                        <li key={source.post_id}>
                          <span className="jb-ask-num">[{n + 1}]</span>
                          <a href={linkOf({ id: source.post_id, title: source.title }).href} onClick={linkOf({ id: source.post_id, title: source.title }).onClick} className="jb-link">
                            {source.title}
                          </a>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ),
            )}
            {busy && <p className="jb-ask-msg jb-ask-bot jb-ask-wait">記事を調べています…</p>}
          </div>

          {messages.length === 0 && (
            <div className="jb-ask-starters">
              {STARTER_QUESTIONS.map((starter) => (
                <button key={starter} type="button" className="jb-btn jb-ask-starter" onClick={() => ask(starter)} disabled={busy}>
                  {starter}
                </button>
              ))}
            </div>
          )}

          {full ? (
            <p style={{ fontFamily: FONT_SANS, fontSize: 14, lineHeight: 1.9, color: JB.muted, margin: "12px 0 0" }}>
              1 回の会話は {MAX_TURNS} 往復までです。続けるには「新しく始める」を押してください。
            </p>
          ) : (
            <form
              className="jb-ask-form"
              onSubmit={(event) => {
                event.preventDefault();
                void ask(query);
              }}
            >
              <label className="jb-sr-only" htmlFor="jb-ask-input">
                聞きたいこと
              </label>
              <input
                id="jb-ask-input"
                className="jb-ask-input"
                value={query}
                maxLength={MAX_QUESTION_CHARS}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="聞きたいことを入力"
                autoComplete="off"
              />
              <button type="submit" className="jb-btn jb-btn-dark jb-ask-send" disabled={busy || query.trim().length === 0}>
                {busy ? "調べています" : "聞く"}
              </button>
            </form>
          )}

          <div className="jb-ask-foot">
            <p style={{ margin: 0 }}>{IMPRINT.askNote}</p>
            {messages.length > 0 && (
              <button type="button" className="jb-ask-reset" onClick={() => setMessages([])} disabled={busy}>
                新しく始める
              </button>
            )}
          </div>
        </>
      )}

      {MemberDialog ? (
        <MemberDialog open={join !== null} mode={join ?? "signup"} presenters={presenters} onClose={() => setJoin(null)} />
      ) : null}
    </section>
  );
}
