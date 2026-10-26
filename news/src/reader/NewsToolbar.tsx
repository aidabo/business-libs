"use client";

import type { Face } from "../core";
import { isBoardFiltered } from "../core";

// 面の絞り込み・記事検索・並び替え。読者面が自分で持つ操作子。
//
// かつてはページビルダーの共有部品（TagFilterBar / PostSearchBar / OrderBar）を
// 並べていた。あれらは「選ばれた値を共有ページ状態に書き、契約イベントを流す」形で、
// 受け手（ページビルダーでは datasource）が別に居る前提になっている。この面には
// 受け手が同じ場所に居るので、その一段を挟む理由が無い。ここで直接 state を上げる。
//
// 並び替えの選択肢は 4 つに絞る（向こうの既定は 8 つ）。読者面で使うのは日付と
// 反響の 2 系統で、`comments` / `bookmarks` / `forwards` はこの面のデータでは
// ほぼ 0 になり、選んでも並びが変わらないため。

const ORDER_CHOICES = [
  { value: "published_at desc", label: "新しい順" },
  { value: "published_at asc", label: "古い順" },
  { value: "updated_at desc", label: "更新が新しい順" },
  { value: "favors desc", label: "反響の多い順" },
];

export default function NewsToolbar({
  faces,
  selectedFaces,
  keyword,
  order,
  onToggleTag,
  onKeyword,
  onOrder,
  onReset,
}: {
  /** 面の一覧。Ghost の内部タグから発見したもの（useNewsPosts）。 */
  faces: Face[];
  /** 選ばれている面名。 */
  selectedFaces: string[];
  keyword: string;
  order: string;
  onToggleTag: (label: string) => void;
  onKeyword: (value: string) => void;
  onOrder: (value: string) => void;
  onReset: () => void;
}) {
  const selected = new Set(selectedFaces);
  const filtered = isBoardFiltered(selectedFaces, keyword);

  return (
    <div className="jb-toolbar">
      <div className="jb-chip-set" role="group" aria-label="面で絞る">
        {faces.map((face) => {
          const on = selected.has(face.label);
          return (
            <button
              key={face.label}
              type="button"
              className="jb-chip-btn"
              aria-pressed={on}
              onClick={() => onToggleTag(face.label)}
            >
              {face.label}
            </button>
          );
        })}
      </div>

      <div className="jb-toolbar-tail">
        <label className="jb-sr-only" htmlFor="jb-news-q">
          記事を検索
        </label>
        <input
          id="jb-news-q"
          className="jb-search"
          type="search"
          value={keyword}
          placeholder="記事を検索"
          onChange={(event) => onKeyword(event.target.value)}
        />

        <label className="jb-sr-only" htmlFor="jb-news-order">
          並び替え
        </label>
        <select
          id="jb-news-order"
          className="jb-select"
          value={order}
          onChange={(event) => onOrder(event.target.value)}
        >
          {ORDER_CHOICES.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>

        {/* 解除は絞り込みが効いているときだけ出す。常時出すと、押しても何も
            起きない場面（未選択のとき）ができる。 */}
        {filtered ? (
          <button type="button" className="jb-chip-btn jb-chip-reset" onClick={onReset}>
            解除
          </button>
        ) : null}
      </div>
    </div>
  );
}
