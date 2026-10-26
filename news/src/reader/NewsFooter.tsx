"use client";

import { useNews } from "../adapter/NewsContext";
import { usePaperSettings } from "../shared/PaperSettingsContext";
import { usePaperEdition } from "../shared/usePaperDate";
import { FONT_SANS, FONT_SERIF, JB } from "../core";
import type { Face } from "../core";
import { IMPRINT } from "./content";

// 奥付。架空の新聞社として完結させる（取引先名・商流上の関係者名は出さない）。
// 会員の仕組みは Codex が進行中なので、価格もプランもここには書かない。
//
// 面の並びは props で受ける。面は Ghost の内部タグから発見するもので、この部品は
// それを取りに行かないため（記事ページのように面の一覧を持たない所からも使う）。
// 渡されなければ面の欄ごと出さない。在りもしない面を並べるより空けるほうがよい。
export default function NewsFooter({
  faces = [],
  publisher = IMPRINT.publisher,
  membershipNote = IMPRINT.membershipNote,
  platformNote = IMPRINT.platformNote,
  demoNote = IMPRINT.demoNote,
}: {
  faces?: Face[];
  /** 発行所（著作権表記の持ち主）。テナントごとに変える。 */
  publisher?: string;
  membershipNote?: string;
  platformNote?: string;
  /** 架空・デモの断り。空なら出さない。 */
  demoNote?: string;
}) {
  const edition = usePaperEdition();
  const { paperName } = usePaperSettings();
  const { Copyright } = useNews().adapter;
  return (
    <footer style={{ background: JB.ink, color: JB.paper, marginTop: "clamp(40px, 5vw, 72px)" }}>
      <div className="jb-wrap" style={{ paddingTop: "clamp(28px, 3.4vw, 44px)", paddingBottom: "clamp(28px, 3.4vw, 44px)" }}>
        <div className="jb-imprint">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 12, height: 12, background: JB.accent, display: "block" }} />
              <span style={{ fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 700, letterSpacing: "0.08em" }}>
                {paperName}
              </span>
            </div>
            <p style={{ fontFamily: FONT_SANS, fontSize: 12.5, lineHeight: 2, color: JB.mutedOnDark, margin: "12px 0 0" }}>
              {publisher}
              <br />
              {edition ?? ""}
            </p>
          </div>

          {faces.length > 0 && (
            <div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 14, fontWeight: 600, marginBottom: 10 }}>面</div>
              <nav style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {faces.map((face) => (
                  <a
                    key={face.label}
                    href={`#jb-face-${face.slug || face.label}`}
                    className="jb-link"
                    style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: "#c9c0ad", textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center" }}
                  >
                    {face.label}
                  </a>
                ))}
              </nav>
            </div>
          )}

          <div>
            <div style={{ fontFamily: FONT_SERIF, fontSize: 14, fontWeight: 600, marginBottom: 10 }}>この紙面について</div>
            <p style={{ fontFamily: FONT_SANS, fontSize: 12.5, lineHeight: 2, color: JB.mutedOnDark, margin: 0 }}>
              {membershipNote}
              <br />
              {platformNote}
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: 26,
            paddingTop: 16,
            borderTop: `1px solid ${JB.lineDark}`,
            fontFamily: FONT_SANS,
            fontSize: 11,
            color: "#6f685c",
          }}
        >
          {/*
            著作権表記は共有部品 Copyright に出す（年の繰り上がりを自前で書かない）。
            - owner は発行所。創刊年は持っていないので startYear は渡さない
              （架空の年を作らない。渡さなければ今年だけが出る）。
            - links は渡さない。利用規約・プライバシーの面はこのテナントに無く、
              在りもしない面へのリンクを並べることになるため。
            - color は既定の #6b7280 がこの濃さの地に 4.5:1 を割るので、
              奥付の他の行と同じ mutedOnDark にする。
            - この部品は単体で置けるよう自前の px-4 を持っている。奥付の左端に
              揃えるため、その分だけ戻す。
          */}
          <div style={{ marginLeft: -16, marginRight: -16 }}>
            {Copyright ? (
              <Copyright
                owner={publisher}
                suffix="無断転載を禁じます。"
                align="left"
                fontFamily={FONT_SANS}
                fontSize={12.5}
                color={JB.mutedOnDark}
              />
            ) : (
              <p style={{ margin: 0, padding: "0 16px", fontSize: 12.5, color: JB.mutedOnDark }}>
                © {new Date().getFullYear()} {publisher} 無断転載を禁じます。
              </p>
            )}
          </div>
          {/*
            デモの断りは題字の下と同じ文（IMPRINT.demoNote）を使う。書き写すと
            片方だけ直したときに食い違う。色はこの地で 7.29:1（muted のままだと
            3.47:1 で小さすぎる）。
          */}
          {demoNote ? <span style={{ color: JB.mutedOnDark }}>{demoNote}</span> : null}
        </div>
      </div>
    </footer>
  );
}
