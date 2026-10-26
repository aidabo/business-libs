"use client";

import { useState } from "react";
import { facePrintOf, type Face } from "../core";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import { ConfirmSheet, EditLink, fieldStyle } from "./parts";
import {
  buildWritePlan,
  faceSlugOfArticle,
  type DeskArticle,
  type DeskTag,
  type FrontCandidate,
  type WriteDraft,
} from "./model";

/**
 * 記事 1 本の割付を書く 1 枚。**書きはここから `onWrite` → `desk.write` → `PUT /posts/{id}/` の 1 本**（spec §6）。
 *
 * ここが持つのは **面・媒体・主役・絵**だけ。**本文と公開（予約公開も）は既存の `/editor`** が持つ
 * （ユーザー指示 2026-10-03「記事書く、編集、作成、公開などの機能はすでにある、/editor,/panelを
 * 確認してください、予約公開でもあります。既存利用してください」）。机が公開まで持つと、同じ操作の
 * 口が 2 つになり、片方だけ直したときに食い違う。
 *
 * 変わっていない欄は送らない（buildWritePlan が落とす）— 触っていないのに `tags` や
 * `featured` を送ると、要らない書き込みで `updated_at` が進み、読者面に「差し替え」の印が付く。
 */
export default function WriteDialog({
  article,
  faces,
  mediums,
  siblings,
  canPublish,
  busy,
  onClose,
  onWrite,
}: {
  article: DeskArticle;
  faces: Face[];
  mediums: DeskTag[];
  siblings: FrontCandidate[];
  canPublish: boolean;
  busy?: boolean;
  onClose: () => void;
  onWrite: (patch: Record<string, unknown>) => void;
}) {
  const [faceSlug, setFaceSlug] = useState(faceSlugOfArticle(article));
  const [mediumSlug, setMediumSlug] = useState(
    article.tags.find((tag) => mediums.some((m) => m.slug === tag.slug))?.slug ?? ""
  );
  const [featured, setFeatured] = useState(article.featured);
  const [featureImage, setFeatureImage] = useState(article.feature_image ?? "");
  const [confirm, setConfirm] = useState<{ lines: string[]; patch: Record<string, unknown> } | null>(null);
  // 押したのに何も起きない画面にしない — 変わっていないときはそう言う。
  const [unchanged, setUnchanged] = useState(false);

  const ask = () => {
    const draft: WriteDraft = { faceSlug, mediumSlug, featured, featureImage };
    const plan = buildWritePlan(article, draft, faces, mediums, siblings);
    // 何も変わっていないなら、確認の 1 枚も出さない（書くことが無い）— が、黙らずに言う。
    if (plan.lines.length === 0) {
      setUnchanged(true);
      return;
    }
    setUnchanged(false);
    setConfirm({ lines: plan.lines, patch: plan.patch });
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="割付を書く"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(20, 18, 14, 0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          zIndex: 70,
        }}
      >
        <div style={{ background: JB.white, border: `1px solid ${JB.ink}`, maxWidth: 640, width: "100%", maxHeight: "90vh", overflow: "auto" }}>
          <div style={{ borderBottom: `1px solid ${JB.ink}`, padding: "14px 18px" }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: "0.08em", color: JB.accent }}>
              割付
            </div>
            <h3 style={{ fontFamily: FONT_SERIF, fontSize: 17, margin: "6px 0 0", color: JB.ink }}>{article.title}</h3>
            <div style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: JB.muted, marginTop: 6 }}>
              {article.slug}
            </div>
          </div>

          <div style={{ display: "grid", gap: 14, padding: "16px 18px", fontFamily: FONT_SANS, fontSize: 13 }}>
            <label>
              面
              <select value={faceSlug} onChange={(e) => setFaceSlug(e.target.value)} style={fieldStyle}>
                <option value="">（面なし）</option>
                {faces.map((face) => (
                  <option key={face.slug} value={face.slug}>
                    {facePrintOf(face.label)} {face.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              媒体
              <select value={mediumSlug} onChange={(e) => setMediumSlug(e.target.value)} style={fieldStyle}>
                <option value="">（媒体なし）</option>
                {mediums.map((medium) => (
                  <option key={medium.slug} value={medium.slug}>
                    {medium.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              主役にする（第一面に出ます）
            </label>

            <label>
              絵（feature_image）
              <input
                type="text"
                value={featureImage}
                onChange={(e) => setFeatureImage(e.target.value)}
                placeholder="https://…"
                style={fieldStyle}
              />
            </label>
            <div style={{ color: JB.muted, fontSize: 11.5, lineHeight: 1.8 }}>
              絵は無くて構いません（短い短信は絵が間に合わないものです）。重要度は主役で表します。
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", padding: "0 18px 18px" }}>
            <button type="button" onClick={onClose} style={buttonStyle(false, false)}>
              閉じる
            </button>
            <button
              type="button"
              disabled={!canPublish}
              onClick={ask}
              style={buttonStyle(true, !canPublish)}
            >
              割付を書く
            </button>
            <EditLink postId={article.id} />
            {unchanged && (
              <span role="status" style={{ fontFamily: FONT_SANS, fontSize: 12, color: JB.accent }}>
                変更はありません。
              </span>
            )}
            <span style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: JB.muted }}>
              本文を書く・公開する（予約も）は「編集」から。
            </span>
          </div>
        </div>
      </div>

      <ConfirmSheet
        open={confirm !== null}
        title={article.title}
        lines={confirm?.lines ?? []}
        okLabel="割付を書く"
        busy={busy}
        onOk={() => {
          if (!confirm) return;
          onWrite(confirm.patch);
          setConfirm(null);
          onClose();
        }}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}

function buttonStyle(primary: boolean, disabled: boolean): React.CSSProperties {
  return {
    fontFamily: FONT_SANS,
    fontSize: 12.5,
    padding: "8px 14px",
    border: `1px solid ${primary ? JB.accent : JB.line}`,
    background: primary ? JB.accent : "transparent",
    color: primary ? JB.paper : JB.ink,
    opacity: disabled ? 0.45 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}
