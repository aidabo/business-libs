import { useSyncExternalStore } from "react";

// 文字サイズは「標準／大」の 2 段。掛ける先は 2 つで 1 組 — ルート要素（html）の
// font-size（rem で書いた文字）と、紙面 .jb-news の zoom（px で組んだ文字。
// PaperStyles）。画面ごとに px を書き分けないのは同じ。
//
// 状態はモジュール側に置く。同じ操作をヘッダの広い画面用と狭い画面用の 2 か所に
// 出すため、各インスタンスが useState を持つと片方を押したときもう片方の表示が
// 食い違う。useSyncExternalStore で同じ状態を見るようにしている。
export type FontScale = "normal" | "large";

/** localStorage のキー。index.html の先頭にある復元スクリプトと同じ文字列にする。 */
const STORAGE_KEY = "jb-font-scale";
/** ルート要素に付ける属性。CSS 側は html[data-font-scale="large"] で見ている。 */
const ATTR = "data-font-scale";

const listeners = new Set<() => void>();

function readScale(): FontScale {
  if (typeof document === "undefined") return "normal";
  return document.documentElement.getAttribute(ATTR) === "large" ? "large" : "normal";
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setFontScale(next: FontScale): void {
  document.documentElement.setAttribute(ATTR, next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // 保存できない環境（プライベートモード等）でも、その場の切り替えは効かせる。
  }
  listeners.forEach((listener) => listener());
}

/**
 * 保存された「大」を読み直してルート属性を戻す。元の会社サイトでは index.html の
 * 先頭の復元スクリプトが担当していた（この Next の面にはそれが無いので、ここで
 * 読み込み時に 1 回だけ呼ぶ）。読み直すのは「大」のときだけ — 既定（標準）では
 * 属性を付けない。保存を読めない環境でも、既定の標準のまま動く。
 */
export function restoreFontScale(): void {
  if (typeof document === "undefined") return;
  try {
    if (window.localStorage.getItem(STORAGE_KEY) === "large") {
      document.documentElement.setAttribute(ATTR, "large");
    }
  } catch {
    // 読めない環境では既定の標準のまま。
  }
}

// 読み込み時に復元する（クライアントでだけ — SSR には document が無い）。この
// モジュールが読まれた時点で属性が戻る（ハイドレーションは待たない）。SSR の HTML
// 自体は標準で描かれるので、通信が遅いと一瞬だけ標準が見えることはある。
if (typeof document !== "undefined") restoreFontScale();

export function useFontScale(): [FontScale, (next: FontScale) => void] {
  const scale = useSyncExternalStore(subscribe, readScale, () => "normal" as FontScale);
  return [scale, setFontScale];
}

const OPTIONS: Array<{ value: FontScale; label: string }> = [
  { value: "normal", label: "標準" },
  { value: "large", label: "大" },
];

// 文字サイズ切替。今どちらが選ばれているかを aria-pressed で読み上げにも伝える。
// ヘッダの広い画面用と狭い画面用で 2 つ置くため、class で出し分けられるようにしてある。
export default function FontScaleToggle({ className }: { className?: string }) {
  const [scale, set] = useFontScale();

  return (
    <div className={["jb-fs", className].filter(Boolean).join(" ")} role="group" aria-label="文字サイズ">
      <span className="jb-fs-label">文字サイズ</span>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className="jb-fs-btn"
          aria-pressed={scale === option.value}
          onClick={() => set(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
