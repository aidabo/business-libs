// 紙面と編集局の画面のスタイル。インライン style で書けないものだけをここに置く:
//   - @import（Web フォント。オフラインなら OS の明朝／ゴシックに自然に落ちる）
//   - レイアウト（列数はここで決める。画面側は class を付けるだけ）
//   - @keyframes（モーション）と :hover
//   - コンテナクエリ（紙面モックを親幅に比例させる）
//
// 中身はすべて静的な文字列リテラル。外から値を差し込む箇所は無い
// （dangerouslySetInnerHTML を使うが、テンプレートに変数は入らない）。
//
// Page Builder では部品が 1 個ずつ置かれるので、各部品が <style> を出すと同じ 660 行が
// 部品の数だけ並ぶ。ページに 1 つだけ head へ入れる（usePaperStyles）。
import { useEffect } from "react";

const STYLE_ID = "jb-paper-styles";

export const PAPER_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;600;700&display=swap');

/* ============ 版面 ============ */
/* 幅は 1600px を基準に、余白は clamp で可変。狭い画面でも本文が細くならない。 */
.jb-wrap {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding-left: clamp(18px, 4.2vw, 36px);
  padding-right: clamp(18px, 4.2vw, 36px);
  box-sizing: border-box;
}
/* 携帯の紙面（/home/news ほか .jb-news の面）は左右の余白を 12px に縮める（ユーザー指示 2026-10-17）。
   机（.jb-console-wrap の --jb-gutter）と同じ幅。「大」では .jb-news の zoom で約 14px になる。 */
@media (max-width: 699px) {
  .jb-news .jb-wrap { padding-left: 12px; padding-right: 12px; }
}
/* 携帯の幅ではページのスクロールバーに場所を取らせない（ユーザー指示 2026-10-17: 開発と実機を同じに）。
   globals.css の ::-webkit-scrollbar { width: 6px } は Chrome の開発者ツールの携帯表示では右端に 6px を取り、
   左右の余白が 12px / 18px に見えていた。実機（iOS / Android）のスクロールバーは中身に重なるので場所を取らない。
   このスタイルは紙面と机の画面にだけ載る（PaperStyles）ので、他の画面のスクロールバーは変えない。 */
@media (max-width: 699px) {
  html { scrollbar-width: none; }
  html::-webkit-scrollbar { width: 0; height: 0; }
}

/* ============ レイアウト（列数） ============ */
.jb-hero-grid { display: grid; grid-template-columns: 1fr; gap: clamp(34px, 5vw, 64px); align-items: center; }
@media (min-width: 1000px) { .jb-hero-grid { grid-template-columns: 1.02fr .98fr; } }

.jb-services { display: grid; grid-template-columns: 1fr; }
@media (min-width: 620px)  { .jb-services { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1000px) { .jb-services { grid-template-columns: repeat(3, 1fr); } }

.jb-flow { display: grid; grid-template-columns: 1fr; }
@media (min-width: 880px) { .jb-flow { grid-template-columns: repeat(3, 1fr); gap: 0 44px; } }

.jb-pipeline { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 740px) { .jb-pipeline { grid-template-columns: repeat(4, 1fr); gap: 0; } }

.jb-3col { display: grid; grid-template-columns: 1fr; }
@media (min-width: 880px) { .jb-3col { grid-template-columns: repeat(3, 1fr); gap: 0 clamp(20px, 3vw, 44px); } }

.jb-kpi { display: grid; grid-template-columns: 1fr; }
@media (min-width: 700px) { .jb-kpi { grid-template-columns: repeat(3, 1fr); } }

.jb-two { display: grid; grid-template-columns: 1fr; gap: 30px; }
@media (min-width: 900px) {
  .jb-two { grid-template-columns: 1.15fr .85fr; gap: clamp(36px, 4vw, 64px); align-items: start; }
  .jb-two-even { grid-template-columns: .95fr 1.05fr; }
}

.jb-footer { display: grid; grid-template-columns: 1fr; gap: 20px; }
@media (min-width: 840px) { .jb-footer { grid-template-columns: auto 1fr auto; gap: 44px; align-items: center; } }

/* ============ 運用コンソール（/dashboard/news） ============ */
/* 外の左右余白は PC・携帯とも無し（ユーザー指示 2026-10-12）。.jb-wrap の clamp 余白は
   公開面のためのもので、机は画面幅いっぱいに使う。インライン style に勝つため !important。 */
.jb-console-wrap { padding-left: 0 !important; padding-right: 0 !important; }
/* 携帯の左右余白は **1 つ（--jb-gutter: 12px）を 1 回だけ** 当てる（ユーザー指示 2026-10-15）。
   外枠（.jb-console-wrap）とタブの中（.jb-tab-body）は 0、パネルの見出しと中身（.jb-panel-pad）と、
   パネルの外に置く物（上の数字・「新しく書く」の段・書けなかった帯 = .jb-console-gutter）が同じ 12px —
   二重に足さないので、カードの端・見出し・絞りのバーが同じ線に揃い、本文の幅が最も広くなる。PC は変えない。 */
@media (max-width: 699px) {
  .jb-console-wrap { --jb-gutter: 12px; }
  .jb-tab-body { padding: 0 !important; }
  .jb-tab-body .jb-panel-pad { padding-left: var(--jb-gutter) !important; padding-right: var(--jb-gutter) !important; }
  .jb-console-gutter { padding-left: var(--jb-gutter); padding-right: var(--jb-gutter); }
  /* 余白を外すとタブの枠とパネルの枠が二重線になる — 直下のパネルの枠を消す */
  .jb-tab-body > section { border: 0 !important; }
  /* タブの枠の左右の線も外す（画面の端そのものが枠）。残すと中身が上の数字より 1px 内側にずれる。 */
  .jb-console-frame { border-left: 0 !important; border-right: 0 !important; }
}
/* とても狭い画面（≤360px）のカードは 1 列・幅いっぱい。絵が主役の素材と紙面は 2 列（1 枚 ≥140px）。
   列数の口（columns.tsx）の式はインライン style なので !important で勝つ。 */
@media (max-width: 360px) {
  .jb-card-grid { grid-template-columns: minmax(0, 1fr) !important; }
  .jb-card-grid-media { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
}
/* 机の数字（MetricCards）。
   PC（1200px 以上）は **1 段**（ユーザー指示 2026-10-17）: 今日の紙面 ＋ 残りの升をすべて横に並べる。
   升の数は区分不明の有無で 8 か 9 になるので、列は auto で足す（grid-auto-flow: column）。
   中くらいの幅（900–1199px）は 2 段（2026-10-15 の形）:
     1 段目 = 今日の紙面 ＋ 公開・予約・下書き・予約の時刻を過ぎ
     2 段目 = 記事（全部）＋ 無料・会員・有料（区分不明が在れば 5 つ目）
   狭い画面は 4 列の小さな升に詰める（今日の紙面は 1 行の帯で幅いっぱい）— 縦に 8 枚積まない。 */
.jb-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.jb-metrics .jb-metric { padding: 7px 8px; min-width: 0; }
.jb-metrics .jb-metric-label { font-size: 10px; letter-spacing: 0.04em; line-height: 1.3; }
.jb-metrics .jb-metric-num { font-size: 19px; }
.jb-metrics .jb-metric-long { display: none; }
.jb-metrics .jb-metric-today { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 12px; }
@media (min-width: 900px) {
  .jb-metrics { grid-template-columns: minmax(0, 1.5fr) repeat(4, minmax(0, 1fr)); gap: 10px; }
  .jb-metrics .jb-metric { padding: 10px 16px; }
  .jb-metrics .jb-metric-label { font-size: 11px; letter-spacing: 0.16em; }
  .jb-metrics .jb-metric-num { font-size: 26px; }
  .jb-metrics .jb-metric-long { display: inline; }
  .jb-metrics .jb-metric-short { display: none; }
  .jb-metrics .jb-metric-today { grid-column: auto; display: block; }
}
@media (min-width: 1200px) {
  .jb-metrics { grid-template-columns: minmax(0, 2fr); grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 8px; }
  .jb-metrics .jb-metric { padding: 10px 12px; }
  .jb-metrics .jb-metric-label { letter-spacing: 0.06em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .jb-metrics .jb-metric-num { font-size: 24px; }
}

.jb-console-grid { display: grid; grid-template-columns: 1fr; gap: 18px; }
@media (min-width: 1080px) {
  .jb-console-grid { grid-template-columns: minmax(0, 1.5fr) minmax(0, .92fr); gap: 20px; align-items: start; }
  .jb-console-side { position: sticky; top: 96px; }
}

.jb-papers { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 700px) { .jb-papers { grid-template-columns: repeat(3, 1fr); } }

.jb-backnum { display: grid; grid-template-columns: 1fr; gap: 20px; }
@media (min-width: 820px) { .jb-backnum { grid-template-columns: 236px minmax(0, 1fr); gap: 26px; align-items: start; } }

.jb-month {
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  width: 100%; text-align: left; cursor: pointer;
  background: transparent; border: none; border-bottom: 1px solid #ddd5c6;
  padding: 12px 2px; transition: background-color 180ms ease, padding-left 180ms ease;
}
.jb-month:hover { background-color: #f7f4ee; padding-left: 8px; }
.jb-month[data-active="true"] { background-color: #f7f4ee; box-shadow: inset 3px 0 0 #b5121b; padding-left: 10px; }

/* ============ 罫線の引き方（広い画面は縦、狭い画面は横） ============ */
.jb-kpi-cell { padding: 24px 0; }
@media (max-width: 699px) {
  .jb-kpi-cell + .jb-kpi-cell { border-top: 1px solid #ddd5c6; }
}
@media (min-width: 700px) {
  .jb-kpi-cell { padding: 30px 0; }
  .jb-kpi-cell + .jb-kpi-cell { border-left: 1px solid #ddd5c6; padding-left: 32px; }
}

/* 導入の流れ: 各段の上に墨の罫。狭い画面では段の下にも細い罫を入れて区切る。 */
.jb-flow-cell { padding-top: 22px; border-top: 1px solid #12100e; }
@media (max-width: 879px) {
  .jb-flow-cell { padding-bottom: 24px; border-bottom: 1px solid #ddd5c6; }
  .jb-flow-cell:last-child { border-bottom: none; }
}
@media (min-width: 880px) {
  .jb-flow-cell { padding-bottom: 0; border-bottom: none; }
}

/* ============ ナビ（広い画面は横並び、狭い画面は横スクロールの帯） ============ */
.jb-nav { display: none; }
@media (min-width: 920px) { .jb-nav { display: flex; align-items: center; gap: 26px; } }

.jb-navscroll { display: flex; gap: 20px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; }
.jb-navscroll::-webkit-scrollbar { display: none; }
@media (min-width: 920px) { .jb-navscroll { display: none; } }

.jb-hide-sm { display: none; }
@media (min-width: 560px) { .jb-hide-sm { display: block; } }

/* デモの断り（題字の下の朱の囲み）。携帯では折り返すと 4〜5 行を取るので、
   1 行の横スクロール帯にする（2026-10-27 ユーザー指示）。広い画面は従来どおり折り返す。 */
@media (max-width: 699px) {
  .jb-demo-note { white-space: nowrap; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; }
  .jb-demo-note::-webkit-scrollbar { display: none; }
}

/* ============ 紙面モック（親幅に比例して拡大縮小） ============ */
.jb-paper-box { container-type: inline-size; width: 100%; }
.jb-paper-fluid { font-size: 9px; }
@supports (font-size: 1cqw) {
  .jb-paper-fluid { font-size: clamp(7.5px, 2.32cqw, 19px); }
}

/* ============ スクロールで現れる ============ */
.jb-reveal {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 820ms cubic-bezier(.22,.61,.36,1), transform 820ms cubic-bezier(.22,.61,.36,1);
}
.jb-reveal.is-in { opacity: 1; transform: none; }

/* ============ 飾り罫が左から伸びる ============ */
.jb-rule { animation: jb-rule-grow 900ms cubic-bezier(.22,.61,.36,1) both; transform-origin: left center; }
@keyframes jb-rule-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }

/* ============ 紙面を読み取るスキャン（紙面 → デジタル） ============ */
.jb-scan {
  position: absolute;
  left: 0; right: 0; top: 0;
  height: 20%;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(181,18,27,0) 0%, rgba(181,18,27,.10) 42%, rgba(24,20,16,.09) 58%, rgba(181,18,27,0) 100%);
  border-bottom: 1px solid rgba(181,18,27,.40);
  animation: jb-scan-move 6s cubic-bezier(.45,.05,.55,.95) infinite;
}
@keyframes jb-scan-move {
  0%   { transform: translateY(-40%); opacity: 0; }
  14%  { opacity: 1; }
  86%  { opacity: 1; }
  100% { transform: translateY(460%); opacity: 0; }
}

/* ============ AI の注釈チップ ============ */
.jb-chip { animation: jb-chip-in 720ms cubic-bezier(.22,.61,.36,1) both; }
@keyframes jb-chip-in {
  from { opacity: 0; transform: translateY(10px) scale(.96); }
  to   { opacity: 1; transform: none; }
}

/* ============ データが流れる線 ============ */
.jb-flowline { position: relative; overflow: hidden; }
.jb-flowline::after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(181,18,27,0) 0%, rgba(181,18,27,.9) 50%, rgba(181,18,27,0) 100%);
  background-size: 34% 100%;
  background-repeat: no-repeat;
  animation: jb-flow-run 4.6s linear infinite;
}
@keyframes jb-flow-run {
  from { background-position: -34% 0; }
  to   { background-position: 134% 0; }
}

/* ============ 状態ドット ============ */
.jb-dot { animation: jb-dot-pulse 2.6s ease-in-out infinite; }
@keyframes jb-dot-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }

/* ============ 折れ線の描画 ============ */
/* SVG 側で pathLength={240} を指定しているので、この 240 と必ず一致する */
.jb-spark {
  stroke-dasharray: 240;
  stroke-dashoffset: 240;
  animation: jb-spark-draw 1.6s ease-out .2s forwards;
}
@keyframes jb-spark-draw { to { stroke-dashoffset: 0; } }

/* ============ hover ============ */
.jb-card { transition: background-color 240ms ease; }
.jb-card:hover { background-color: #efe9dd; }

.jb-link { transition: color 160ms ease; }
.jb-link:hover { color: #b5121b; }

/* ログインしていない人への案内（GuestPromo）。墨の地に、放送の動画を主役に置く。
   広い画面は 動画（左）＋文（右）、狭い画面は動画が上で、文と釦を詰めて下に。 */
.jb-promo { display: grid; grid-template-columns: minmax(0, 1fr); background: #12100e; color: #f7f4ee; border-top: 3px solid #b5121b; overflow: hidden; }
@media (min-width: 900px) { .jb-promo { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); } }
.jb-promo-media { display: grid; gap: 6px; padding: 0; background: #000; align-content: start; }
.jb-promo-screen { position: relative; aspect-ratio: 16 / 9; background: #1c1a17; overflow: hidden; }
.jb-promo-screen video, .jb-promo-screen img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.jb-promo-onair { justify-self: start; display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background: #b5121b; color: #fff; font: 700 13px/1 system-ui, sans-serif; letter-spacing: .14em; }
.jb-promo-who { font-size: 16px; font-weight: 700; letter-spacing: .06em; padding-left: 8px; border-left: 1px solid rgba(255,255,255,.6); }
@media (min-width: 900px) { .jb-promo-onair { font-size: 14px; padding: 8px 14px; } .jb-promo-who { font-size: 19px; } }
.jb-promo-dot { width: 7px; height: 7px; border-radius: 50%; background: #fff; animation: jb-promo-blink 1.6s ease-in-out infinite; }
@keyframes jb-promo-blink { 50% { opacity: .25; } }
.jb-promo-caption { position: absolute; left: 0; right: 0; bottom: 0; padding: 28px 14px 12px; background: linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.75)); z-index: 1; display: grid; gap: 2px; font-family: system-ui, sans-serif; pointer-events: none; }
.jb-promo-title { font-size: clamp(14px, 1.6vw, 17px); font-weight: 600; line-height: 1.45; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.6); }
.jb-promo-strip { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; padding: 0 0 6px; }
.jb-promo-tile { position: relative; display: block; aspect-ratio: 16 / 9; overflow: hidden; background: #1c1a17; }
.jb-promo-tile img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 600ms ease; }
.jb-promo-tile:hover img { transform: scale(1.05); }
.jb-promo-paper img { object-fit: cover; object-position: top; }
.jb-promo-paper span { position: absolute; left: 0; bottom: 0; padding: 3px 7px; background: rgba(18,16,14,.85); color: #f7f4ee; font: 11px/1.4 system-ui, sans-serif; letter-spacing: .08em; }
.jb-promo-copy { padding: 18px 16px 20px; min-width: 0; display: flex; flex-direction: column; }
.jb-promo-media { min-width: 0; }
@media (min-width: 900px) { .jb-promo-copy { padding: clamp(24px, 3vw, 44px); } }
.jb-promo-heading { font-size: clamp(22px, 2.6vw, 34px); line-height: 1.3; letter-spacing: .02em; }
.jb-promo-lead { font-size: 13.5px; line-height: 1.9; }
@media (min-width: 900px) { .jb-promo-lead { font-size: 14.5px; } }
/* バーチャルアナウンサーの顔（Avatar Profile の active な絵）。狭い画面は横に流す。 */
.jb-promo-cast { margin: 0 0 16px; padding-bottom: 14px; border-bottom: 1px solid #2a2723; }
.jb-promo-cast-title { font-size: 20px; font-weight: 700; color: #f7f4ee; letter-spacing: .06em; }
/* 顔は列の幅を等分（1 段に最大 5 人、それより多ければ次の段へ。列数は GuestPromo が渡す）。
   携帯（<600px）と、2 列で右の列が狭い幅（900〜1199px）は 1 段 3 人にして大きく見せ、余りの段は中央に寄せる。
   横に流すと 5 人目が隠れて「4 人しかいない」に見えるので、どの幅でも流さない。 */
.jb-promo-faces { --jb-cast-gap: 12px; list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 14px var(--jb-cast-gap); }
.jb-promo-faces li { flex: 0 0 calc((100% - (var(--jb-cast-cols, 5) - 1) * var(--jb-cast-gap)) / var(--jb-cast-cols, 5)); min-width: 0; display: grid; justify-items: center; align-content: start; gap: 6px; }
@media (max-width: 599px) { .jb-promo-faces { --jb-cast-cols: 3 !important; --jb-cast-gap: 16px; } .jb-promo-faces img { max-width: 104px; } }
/* 2 列の画面でも右の列が狭いあいだ（900〜1199px）は 1 段 3 人（5 人だと 60px 台まで縮む）。 */
@media (min-width: 900px) and (max-width: 1199px) { .jb-promo-faces { --jb-cast-cols: 3 !important; } }
.jb-promo-faces img { width: 100%; max-width: 112px; aspect-ratio: 1 / 1; height: auto; border-radius: 50%; object-fit: cover; object-position: top; border: 2px solid #b5121b; background: #1c1a17; }
.jb-promo-faces span { font: 12px/1.35 system-ui, sans-serif; color: #f7f4ee; text-align: center; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.jb-promo-features { list-style: none; margin: 14px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.jb-promo-features li { display: flex; align-items: center; gap: 7px; padding: 7px 9px; border: 1px solid #2a2723; font: 12.5px/1.3 system-ui, sans-serif; color: #f7f4ee; }
.jb-promo-primary, .jb-promo-secondary { display: inline-flex; align-items: center; min-height: 44px; padding: 12px 22px; font: 14px/1 system-ui, sans-serif; letter-spacing: .04em; text-decoration: none; border: 1px solid #b5121b; }
.jb-promo-primary { background: #b5121b; color: #fff; }
.jb-promo-primary:hover { background: #8f0e15; border-color: #8f0e15; }
.jb-promo-secondary { background: transparent; color: #f7f4ee; border-color: #6b6459; }
/* 狭い画面は詰める: 説明は 2 行で切り、印の升を小さく、ON AIR の札は名乗りを外す。 */
@media (max-width: 899px) {
  .jb-promo-cast-title { font-size: 16px !important; }
  .jb-promo-faces { margin-top: 10px; }
  .jb-promo-faces span { font-size: 11.5px; }
  .jb-promo-copy { padding: 14px 14px 16px; }
  .jb-promo-lead { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; font-size: 12.5px; line-height: 1.75; margin-top: 8px !important; }
  .jb-promo-features { margin-top: 10px; gap: 4px; }
  .jb-promo-features li { padding: 5px 7px; font-size: 11.5px; }
  .jb-promo-primary, .jb-promo-secondary { min-height: 42px; padding: 10px 18px; }
}
@media (prefers-reduced-motion: reduce) { .jb-promo-dot { animation: none; } .jb-promo-tile img { transition: none; } }

.jb-btn { transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease; }
.jb-btn-dark:hover { background-color: #b5121b; border-color: #b5121b; }
.jb-btn-light:hover { background-color: #f7f4ee; border-color: #f7f4ee; color: #12100e; }
.jb-btn-outline:hover { background-color: #12100e; color: #f7f4ee; border-color: #12100e; }

.jb-tile { transition: background-color 240ms ease, border-color 240ms ease; }
.jb-tile:hover { background-color: #1c1a17; border-color: #3a352f; }

/* --- ここから会社サイト（別リポジトリ）から移植（文字サイズ切替と固定題字帯の前提） --- */

/* ブラウザ既定の body margin（8px）を消す。固定した題字帯は版面の端まで広がるので、
   html にも紙色を敷いて、行き過ぎたスクロールで白が覗かないようにする。 */
html { background: #f7f4ee; }
html, body { margin: 0; }

/* 題字帯の実測高さを useStickyNav がここに入れる。着地点をその分だけ下げる。 */
:root { --jb-header-h: 77px; }
section[id] { scroll-margin-top: var(--jb-header-h); }

/* 文字サイズ（標準／大）。掛かり方は 2 つで 1 組:
   - rem で書いた文字 → ルートの font-size
   - px で組んだ紙面（.jb-news）→ 下の zoom
   紙面の文字は px なので、ルートの font-size では 1px も動かない。 */
html { font-size: 100%; }
html[data-font-scale="large"] { font-size: 118%; }
/* 紙面のルート（.jb-news = NewsPaper / BroadcastPage / 縦書き記事面）に 1 つ掛ける。
   zoom は px ごと拡大でき、組んだ文字がにじまない。アンカーの着地点は題字帯の
   実測高さ（useStickyNav の --jb-header-h）で見ているので、拡大しても隠れない。 */
html[data-font-scale="large"] .jb-news { zoom: 1.18; }
.jb-fs { display: inline-flex; align-items: center; gap: 6px; }
/* 切替そのものも px — 紙面の中にあるので、「大」では zoom だけで拡大する
   （rem のままだとルートの font-size と zoom が二重に掛かる）。 */
.jb-fs-label { font-size: 11px; letter-spacing: 0.08em; color: #6b6459; }
.jb-fs-narrow .jb-fs-label { display: none; }
.jb-fs-btn {
  font: inherit; font-size: 11.5px; line-height: 1;
  padding: 7px 10px; min-height: 30px;
  background: transparent; color: #6b6459;
  border: 1px solid #ddd5c6; cursor: pointer;
}
.jb-fs-btn[aria-pressed="true"] { background: #12100e; color: #f7f4ee; border-color: #12100e; }
/* 指で操作する幅では、切替ボタンも 44px 角以上にする。 */
.jb-navband .jb-fs-btn { min-width: 44px; min-height: 44px; }

/* 題字帯の中のナビと同じ境目（920px）で切り替える。既存の .jb-nav /
   .jb-navscroll の切り替えが 920px なので、ここだけ別の値にすると
   920〜その値の間でナビと切替ボタンの出方が食い違う。 */
.jb-fs-wide { display: none; }
@media (min-width: 920px) { .jb-fs-wide { display: inline-flex; } }
@media (min-width: 920px) { .jb-fs-narrow { display: none; } }

/* 見出し語の横の但し書き。ここが出せるときだけ出す（幅を圧迫するため）。 */
.jb-wide-only { display: none; }
@media (min-width: 1280px) { .jb-wide-only { display: block; } }

/* ナビの帯（狭い画面）。横スクロールするリンク群と文字サイズ切替を 1 行に並べる。
   切替はスクロール領域の外に置く（横に送らないと押せない場所には置かない）。 */
.jb-navband { display: flex; align-items: center; gap: 14px; padding-bottom: 10px; margin-top: -2px; }
.jb-navband .jb-navscroll { flex: 1 1 auto; min-width: 0; }
@media (min-width: 920px) { .jb-navband { display: none; } }

/* ナビのリンク。色はここで持つ（インライン style に書くと現在地の朱が勝てない）。
   現在地は aria-current="location" を鍵にするので、読み上げと見た目が食い違わない。
   墨色は紙面の本文と同じ #12100e — 2026-10-07 第2弾のユーザー指示で、タブ全体を
   少し大きく・墨色に揃えた（朱は現在地とホバーだけ）。 */
.jb-nav-a { position: relative; color: #12100e; transition: color 160ms ease; }
.jb-nav-a:hover { color: #b5121b; }
.jb-nav .jb-nav-a { padding-bottom: 5px; }
.jb-navscroll .jb-nav-a { padding-bottom: 4px; border-bottom: 1px solid #ddd5c6; }
.jb-nav-a::after {
  content: "";
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 2px; background: #b5121b;
  transform: scaleX(0); transform-origin: left center;
  transition: transform 220ms cubic-bezier(.22,.61,.36,1);
}
.jb-nav-a[aria-current="location"] { color: #b5121b; border-bottom-color: #b5121b; }
.jb-nav-a[aria-current="location"]::after { transform: scaleX(1); }

/* キーボード操作の可視化。マウス操作では出さず、キーボードで辿ったときだけ枠を出す。 */
:focus-visible { outline: 2px solid #b5121b; outline-offset: 2px; }

/* 読み上げ専用の文言 / 読み飛ばしリンク */
.jb-sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
.jb-skip {
  position: absolute; left: 12px; top: -60px; z-index: 100;
  background: #12100e; color: #f7f4ee; padding: 10px 16px;
  font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
  font-size: 13px; text-decoration: none; transition: top 160ms ease;
}
.jb-skip:focus { top: 12px; }

/* --- 読者面（/home/news） --- */
/* 節の間隔は親の grid gap が持つ。ここでは余白を足さない。 */
.jb-news-section { margin: 0; }
/* News Studio の部品の枠。中身が出ない部品は高さを持たない。 */
.jb-frame-wrap:empty { display: none; }
.jb-news-head { position: sticky; top: 0; z-index: 50; background: #fff; border-bottom: 1px solid #ddd5c6; }
.jb-front { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: clamp(16px, 2.4vw, 30px); }
.jb-front-sub { display: grid; gap: clamp(12px, 1.6vw, 18px); }
.jb-briefs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: clamp(10px, 1.4vw, 16px); }
.jb-flash-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1px; background: #ddd5c6; }
.jb-face-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; border-bottom: 2px solid #12100e; padding-bottom: 7px; }

/* 記事 1 本（面立ての行と結果一覧で共通）。見出しと前文は行数で切る。 */
.jb-cell { display: block; text-decoration: none; color: inherit; min-height: 44px; padding: 2px 0; }
.jb-cell-img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; display: block; background: #efe9dd; margin-bottom: 10px; }
.jb-cell-title {
  font-family: "Noto Serif JP","Yu Mincho","YuMincho","Hiragino Mincho ProN","Times New Roman",serif;
  font-size: clamp(15px, 1.35vw, 16.5px); font-weight: 600; line-height: 1.55; color: #12100e; margin: 0;
}
.jb-cell-excerpt {
  font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
  font-size: 13px; line-height: 1.85; color: #6b6459; margin: 7px 0 0;
}
.jb-cell-meta {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 9px 0 0;
  font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
  font-size: 11.5px; line-height: 1.6; color: #6b6459; letter-spacing: 0.04em;
}
.jb-cell-face { color: #1f3a5f; border: 1px solid #ddd5c6; padding: 0 6px; }
.jb-cell-updated { color: #b5121b; border: 1px solid #b5121b; padding: 0 6px; }
.jb-clamp-2, .jb-clamp-3 { display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
.jb-clamp-2 { -webkit-line-clamp: 2; line-clamp: 2; }
.jb-clamp-3 { -webkit-line-clamp: 3; line-clamp: 3; }

/* 面立て。面ごとに 1 行、記事はその行に横に並ぶ。面の数がいくつでも幅を使い切る
   （面ごとに縦 1 列の箱を作って横に流す形だと、面が 2 つしか無い日に左半分だけ
   埋まって残りが空く）。 */
.jb-face-rows { display: grid; }
.jb-face-row {
  display: grid; grid-template-columns: minmax(0, 1fr);
  gap: 12px; padding: clamp(16px, 2vw, 22px) 0; border-top: 1px solid #ddd5c6;
}
.jb-face-row:first-child { border-top: 2px solid #12100e; }
.jb-face-side { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.jb-face-name {
  font-family: "Noto Serif JP","Yu Mincho","YuMincho","Hiragino Mincho ProN","Times New Roman",serif;
  font-size: clamp(16px, 1.6vw, 19px); font-weight: 700; letter-spacing: 0.1em;
  color: #12100e; margin: 0; padding-left: 10px; border-left: 3px solid #b5121b;
}
/* 面の中分類（その面の記事に付いている公開タグ）。読者が目にするのは「面」ではなく
   この語なので、面名の下に小さく置く。面そのものは内部タグで、読者には見せない。 */
.jb-face-topics {
  list-style: none; margin: 0; padding: 0; max-width: 100%;
  display: flex; flex-wrap: wrap; gap: 0 12px;
}
.jb-face-topics a {
  font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
  font-size: 12px; color: #6b6459; text-decoration: none;
  min-height: 44px; display: inline-flex; align-items: center;
}
.jb-face-items { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px clamp(14px, 1.8vw, 22px); }

/* 結果一覧（面か語で絞ったとき）。面をまたぐので面名も出す。 */
.jb-result-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: clamp(16px, 2vw, 24px) clamp(16px, 2vw, 26px); }

/* 配信中の紙面。紙面は縦長なので、枠も縦長に取る。絵が無ければ枠だけ出る。 */
.jb-paper-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: clamp(12px, 1.6vw, 18px); }
.jb-paper-tile { display: block; text-decoration: none; color: inherit; }
.jb-paper-frame { display: block; aspect-ratio: 3 / 4; overflow: hidden; background: #efe9dd; border: 1px solid #ddd5c6; }
.jb-paper-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.jb-paper-name {
  display: block; margin-top: 8px;
  font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
  font-size: 13px; font-weight: 600; line-height: 1.5; color: #12100e;
}
.jb-paper-pages {
  display: block; margin-top: 3px;
  font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
  font-size: 11.5px; color: #6b6459;
}
/* ============ 読み上げ ============ */
/* 押す場所（記事カードの下・第一面の主役の横）。読み上げの無い記事では
   何も返らないので、この class が付いた要素そのものが出ない。 */
.jb-listen {
  display: inline-flex; align-items: center; gap: 8px;
  margin-top: 8px; min-height: 44px; padding: 0 12px; cursor: pointer;
  font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
  font-size: 12.5px; letter-spacing: 0.04em;
  border: 1px solid #ddd5c6; border-left: 3px solid #1f3a5f;
  background: #fff; color: #12100e;
  transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
}
.jb-listen:hover { border-color: #1f3a5f; border-left-color: #1f3a5f; }
/* 鳴っている最中は朱にする。青（他の押しもの）と混ざらないよう、ここだけ色を変える。 */
.jb-listen[data-playing="true"] { border-color: #b5121b; border-left-color: #b5121b; color: #b5121b; }
.jb-listen-mark { font-size: 10px; line-height: 1; }

.jb-listen-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: clamp(14px, 1.8vw, 22px); margin-top: clamp(14px, 1.8vw, 20px);
}
.jb-listen-item { display: flex; flex-direction: column; align-items: flex-start; border-top: 1px solid #ddd5c6; padding-top: 12px; }
.jb-listen-meta {
  margin: 0; font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
  font-size: 11.5px; letter-spacing: 0.04em; color: #6b6459;
}
.jb-listen-title {
  margin-top: 6px; font-family: "Noto Serif JP","Yu Mincho","YuMincho","Hiragino Mincho ProN","Times New Roman",serif;
  font-size: clamp(15px, 1.4vw, 17px); font-weight: 600; line-height: 1.55;
  color: #12100e; text-decoration: none;
}
.jb-listen-title:hover { color: #b5121b; }
/* 帯のカードの中のプレーヤー（AudioCard）。カードの幅いっぱいに — 縮めると長さの表示が切れる。 */
.jb-listen-player { width: 100%; margin-top: 10px; min-width: 0; }

/* 下に貼り付く帯。z-index は題字帯（50）より上。 */
.jb-audiobar {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 60;
  background: #fff; border-top: 2px solid #b5121b;
  box-shadow: 0 -6px 20px rgba(18,16,14,.12);
}
.jb-audiobar-inner { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
.jb-audiobar-btn, .jb-audiobar-close {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; cursor: pointer;
  border: 1px solid #12100e; background: #12100e; color: #f7f4ee;
  font-size: 12px; line-height: 1;
}
.jb-audiobar-close { border-color: #ddd5c6; background: #fff; color: #6b6459; }
.jb-audiobar-close:hover { border-color: #b5121b; color: #b5121b; }
.jb-audiobar-body { flex: 1 1 180px; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.jb-audiobar-label {
  font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
  font-size: 10.5px; letter-spacing: 0.1em; color: #6b6459;
}
.jb-audiobar-title {
  font-family: "Noto Serif JP","Yu Mincho","YuMincho","Hiragino Mincho ProN","Times New Roman",serif;
  font-size: 14px; font-weight: 600; color: #12100e;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.jb-audiobar-seek { flex: 1 1 120px; min-width: 90px; accent-color: #b5121b; }
.jb-audiobar-time { flex: 0 0 auto; font-size: 12px; font-variant-numeric: tabular-nums; }
/* 狭い画面では位置の表示を落とす（つまみと閉じるを先に残す）。 */
.jb-audiobar-time { display: none; }
@media (min-width: 620px) { .jb-audiobar-time { display: inline; } }

/* 帯が出ている間は、そのぶん下に余白を取る（奥付が帯に隠れないように）。 */
.jb-news[data-audio="true"] { padding-bottom: 74px; }

.jb-ask-form { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
.jb-ask-input {
  flex: 1 1 260px; min-height: 44px; box-sizing: border-box;
  font: inherit; font-size: 16px; padding: 10px 12px;
  border: 1px solid #ddd5c6; background: #fff; color: #12100e;
}
/* 記事に聞く（タイムズくん）。会話の欄は高さを決めて中だけ流す（ページを伸ばし続けない）。
   吹き出しは角を立てたまま（この面は角丸を使わない）、読者は右・係は左。 */
.jb-ask-log {
  display: flex; flex-direction: column; gap: 10px;
  max-height: min(60vh, 520px); overflow-y: auto; overscroll-behavior: contain;
  padding: 14px; background: #fff; border: 1px solid #ddd5c6;
  font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
}
.jb-ask-msg { margin: 0; max-width: min(88%, 640px); padding: 10px 14px; font-size: 15px; line-height: 1.9; word-break: break-word; }
.jb-ask-user { align-self: flex-end; background: #1f3a5f; color: #fff; }
.jb-ask-bot { align-self: flex-start; background: #f4efe4; color: #12100e; border-left: 3px solid #b5121b; }
.jb-ask-bot[data-failed="true"], .jb-ask-wait { color: #6b6459; border-left-color: #ddd5c6; }
.jb-ask-sources { list-style: none; margin: 10px 0 0; padding: 8px 0 0; border-top: 1px solid #ddd5c6; display: grid; gap: 2px; }
.jb-ask-sources li { display: flex; gap: 6px; align-items: baseline; }
.jb-ask-sources a { font-family: "Noto Serif JP","Hiragino Mincho ProN","Yu Mincho",serif; font-size: 14px; font-weight: 600; color: #12100e; text-decoration: none; min-height: 32px; display: inline-flex; align-items: center; }
.jb-ask-num { flex: 0 0 auto; font-size: 12px; font-weight: 700; color: #b5121b; font-variant-numeric: tabular-nums; }
.jb-ask-starters { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.jb-ask-starter {
  font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
  font-size: 14px; min-height: 44px; padding: 0 16px; cursor: pointer;
  border: 1px solid #1f3a5f; background: #fff; color: #1f3a5f;
}
.jb-ask-starter:hover:not(:disabled) { background: #1f3a5f; color: #fff; }
.jb-ask-send {
  min-height: 44px; padding: 0 22px; cursor: pointer;
  font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
  font-size: 14px; letter-spacing: 0.06em; color: #fff; background: #12100e; border: 1px solid #12100e;
}
/* 押せない「聞く」は灰色のまま（.jb-btn-dark:hover の朱を載せない）。 */
.jb-ask-send:disabled, .jb-ask-send:disabled:hover { background: #6b6459; border-color: #6b6459; cursor: default; }
.jb-ask-starter:disabled { opacity: 0.55; cursor: default; }
.jb-ask-foot {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 16px;
  margin-top: 10px; font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
  font-size: 13px; line-height: 1.9; color: #6b6459;
}
.jb-ask-reset { min-height: 44px; padding: 0 4px; background: none; border: none; color: #1f3a5f; font: inherit; text-decoration: underline; cursor: pointer; }
.jb-ask-guest { padding: 18px; background: #f4efe4; border: 1px solid #ddd5c6; }
.jb-imprint { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: clamp(18px, 2.4vw, 34px); }
/* 面立ての道具立て（面で絞る・記事検索・並び替え）。1 行に並べ、狭ければ折り返す。
   押せるものは 44px 以上（この面の規約）。 */
.jb-toolbar {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px;
  padding: 12px 14px; margin-bottom: clamp(16px, 2vw, 24px);
  background: #f4efe4; border: 1px solid #ddd5c6;
}
.jb-chip-set { display: flex; flex-wrap: wrap; gap: 6px; }
.jb-toolbar-tail { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-left: auto; }
.jb-chip-btn {
  font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
  font-size: 13px; min-height: 44px; padding: 0 12px; cursor: pointer;
  border: 1px solid #ddd5c6; background: #fff; color: #1c1a17;
  transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
}
.jb-chip-btn:hover { border-color: #12100e; }
.jb-chip-btn[aria-pressed="true"] { background: #12100e; color: #f7f4ee; border-color: #12100e; }
.jb-chip-reset { border-color: #b5121b; color: #b5121b; }
.jb-search, .jb-select {
  font-family: "Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;
  font-size: 14px; min-height: 44px; box-sizing: border-box; padding: 8px 10px;
  border: 1px solid #ddd5c6; background: #fff; color: #12100e;
}
.jb-search { flex: 0 1 220px; min-width: 150px; }

@media (max-width: 919px) {
  .jb-front { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 899px) {
  .jb-briefs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
/* 面立ては広い画面で「面名の欄＋記事 4 段」。段の間には縦罫を引く。
   罫は行の先頭の段には引かない（段数で先頭が変わるので、それぞれの段数で外す）。 */
@media (min-width: 900px) {
  .jb-face-row { grid-template-columns: 118px minmax(0, 1fr); gap: clamp(16px, 2vw, 26px); align-items: start; }
}
@media (min-width: 620px) {
  .jb-face-items > *:not(:nth-child(2n+1)) { border-left: 1px solid #ddd5c6; padding-left: clamp(14px, 1.8vw, 22px); }
}
@media (min-width: 1080px) {
  .jb-face-items { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .jb-face-items > *:not(:nth-child(4n+1)) { border-left: 1px solid #ddd5c6; padding-left: clamp(14px, 1.8vw, 22px); }
}
@media (max-width: 619px) {
  .jb-briefs { grid-template-columns: minmax(0, 1fr); }
  .jb-face-items { grid-template-columns: minmax(0, 1fr); }
}

/* ============ 動きを減らす設定を尊重する ============ */
@media (prefers-reduced-motion: reduce) {
  .jb-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
  .jb-rule, .jb-scan, .jb-chip, .jb-flowline::after, .jb-dot { animation: none !important; }
  .jb-spark { animation: none !important; stroke-dashoffset: 0 !important; }
  .jb-card, .jb-link, .jb-btn, .jb-tile { transition: none !important; }
  .jb-fs-btn, .jb-skip { transition: none !important; }
  .jb-nav-a, .jb-nav-a::after { transition: none !important; }
  .jb-listen { transition: none !important; }
}
`;

/** 紙面のスタイルを head に 1 つだけ入れる。何個の部品が呼んでも 1 つ。 */
export function usePaperStyles() {
  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = PAPER_CSS;
    document.head.appendChild(style);
  }, []);
}
