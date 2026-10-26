import { faceLabelOfTag } from "./faces";

// /home/news の「記事に聞く」ボット（会員向け、続けて会話できる）。
// 画面（components/press/news/AskPanel.tsx）と口（app/api/news/ask/route.ts）が
// 同じ規則を使えるよう、決まりごとはここに置く。
// 企画・仕組み: docs/planning/janabiz-news-ask-bot-{plan,design}.md

export type AskTurn = { role: "user" | "assistant"; content: string };

export type AskSource = {
  post_id: string;
  title: string;
  excerpt?: string;
  plaintext?: string | null;
  published_at?: string | null;
  featured?: boolean;
  tags?: string[];
};

/** 案内係の名前。 */
export const BOT_NAME = "タイムズくん";
/** 往復の上限。これを超えたら画面が「新しく始める」を促す（費用と話の脱線を抑える）。 */
export const MAX_TURNS = 10;
/** 1 回の質問の長さの上限。 */
export const MAX_QUESTION_CHARS = 300;
/** モデルに渡す過去のやり取り（最後の質問を含めて、この数の発言まで）。 */
export const HISTORY_MESSAGES = 8;
/** 1 回の答えのために AI に渡す記事の数。画面に出すのは、そのうち答えが番号で引いた記事だけ。 */
export const MAX_SOURCES = 6;
/** 1 本の記事から渡す本文の長さ。 */
const BODY_CHARS = 1200;

/** 入口の質問。会話が始まる前だけ出す。押すとそのまま質問として送る。 */
export const STARTER_QUESTIONS = ["今日の一面は？", "最近の経済の記事は？", "速報をまとめて"];

const squash = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();

/**
 * 届いた会話を整える。形の悪い発言は捨て、長すぎる質問は切る。
 * 古い発言はここでは落とさない（往復の上限を数えるため）。AI に渡す分は historyOf で切る。
 */
export function normalizeTurns(raw: unknown): AskTurn[] {
  const list = Array.isArray(raw) ? raw.slice(-(MAX_TURNS * 2 + 2)) : [];
  const turns: AskTurn[] = [];
  for (const item of list) {
    const role = (item as { role?: unknown })?.role;
    if (role !== "user" && role !== "assistant") continue;
    const content = squash((item as { content?: unknown })?.content);
    if (!content) continue;
    turns.push({ role, content: content.slice(0, role === "user" ? MAX_QUESTION_CHARS : 2000) });
  }
  return turns;
}

/** AI に渡す分（直近 HISTORY_MESSAGES 発言）。 */
export function historyOf(turns: AskTurn[]): AskTurn[] {
  return turns.slice(-HISTORY_MESSAGES);
}

export function userTurnCount(turns: AskTurn[]): number {
  return turns.filter((turn) => turn.role === "user").length;
}

/**
 * 記事を探す言葉。最新の質問と、その 1 つ前の質問の 2 本（最新が先）。
 * 「それの続きは？」のような質問は単独では何も当たらないので、前の話題でも引く。
 */
export function searchQueriesOf(turns: AskTurn[]): string[] {
  const asked = turns.filter((turn) => turn.role === "user").map((turn) => turn.content);
  return Array.from(new Set(asked.slice(-2).reverse()));
}

/** ニュースの記事か（面の内部タグ「#○○面」が付いているか）。/home/news に出る記事と同じ判定。 */
export function isNewsSource(source: Pick<AskSource, "tags">): boolean {
  return (source.tags ?? []).some((name) => faceLabelOfTag({ name }) !== null);
}

/**
 * 探した結果を、ニュースの記事だけ・重複なし・上限までにする（先の束を優先）。
 * 束の順は「最新の質問の結果 → 1 つ前の質問の結果 → 新しいニュース」。最後の束は
 * 「今日の一面は？」「速報をまとめて」のように言葉では当たらない質問の受け皿。
 */
export function pickNewsSources(batches: AskSource[][]): AskSource[] {
  const picked: AskSource[] = [];
  const seen = new Set<string>();
  for (const batch of batches) {
    for (const source of batch) {
      if (!source?.post_id || seen.has(source.post_id) || !isNewsSource(source)) continue;
      seen.add(source.post_id);
      picked.push(source);
      if (picked.length >= MAX_SOURCES) return picked;
    }
  }
  return picked;
}

/** 日本時間の日付（YYYY-MM-DD）。「今日」「最近」を AI が判断できるように渡す。 */
export function jstDate(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function buildAskSystemPrompt(paperName: string, today: string): string {
  return [
    `あなたは新聞「${paperName}」の記事案内係「${BOT_NAME}」です。読者（会員）と日本語で会話します。`,
    `今日は ${today}（日本時間）です。`,
    "必ず日本語で答えてください。質問が他の言語でも、答えは日本語です。",
    "答えには、質問に添えて渡す「記事」に書かれていることだけを使ってください。記事に無いことは推測せず、「掲載している記事には見当たりません」と答えてください。",
    "渡す記事には質問と関係の無いものも含まれます。質問に合う記事だけを使い、関係の無い記事は挙げないでください。",
    "質問に合う記事が無いときは、「掲載している記事には見当たりません」と 1〜2 文で答えるだけにしてください。",
    "記事を探して答えること以外（調べ物の約束、予約、通知など）はできません。できないことを申し出ないでください。",
    "記事の内容を使った文には、その記事の番号を [1] や [1][2] の形で付けてください。番号は渡した記事の番号だけを使います。",
    "「第一面」と書いた記事は、その日の第一面に載っている記事です。",
    "答えは短く、3〜5 文ほどにしてください。箇条書きや見出しの記号（#、*、-）は使わないでください。",
    "前のやり取りを踏まえて答えてください。「それ」「その記事」などは、前の話題を指します。",
    `あいさつや使い方を聞かれたときだけ、${BOT_NAME}は記事を探して答える係だと短く伝えてください。それ以外で自己紹介はしないでください。`,
  ].join("\n");
}

export function buildSourceBlock(sources: AskSource[]): string {
  return sources
    .map((source, index) =>
      [
        `[${index + 1}] ${squash(source.title) || "無題"}${source.featured ? "（第一面）" : ""}`,
        source.published_at ? `掲載日: ${jstDate(new Date(source.published_at))}` : "",
        source.excerpt ? `要約: ${squash(source.excerpt)}` : "",
        `本文: ${squash(source.plaintext).slice(0, BODY_CHARS)}`,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");
}

/**
 * 答えの仕上げ。答えが番号で引いた記事だけを残し、番号を出てきた順に 1 から振り直す
 * （画面の記事リンクの番号と揃えるため）。範囲外の番号（[7] など）と Markdown の記号は消す。
 */
export function finalizeAnswer<T extends { post_id: string }>(
  answer: string,
  sources: T[],
): { answer: string; sources: T[] } {
  const order: number[] = [];
  const text = String(answer || "")
    .replace(/\*\*|__|^#+\s*/gm, "")
    .replace(/\[(\d+)\]/g, (_whole, n) => {
      const index = Number(n) - 1;
      if (!Number.isInteger(index) || index < 0 || index >= sources.length) return "";
      if (!order.includes(index)) order.push(index);
      return `[${order.indexOf(index) + 1}]`;
    })
    .replace(/[ \t]+\n/g, "\n")
    .replace(/ +([。、])/g, "$1")
    .trim();
  return { answer: text, sources: order.map((index) => sources[index]) };
}
