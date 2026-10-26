import { FONT_SANS, JB } from "../core";

// 紙面の帯の「すべての…」— 一覧面（/home/news/listen・/home/news/broadcast）への導線。
// 読み上げの帯（ListenBand）と放送の帯（AvatarBroadcastBand）が**同じ 1 つを使う**
// （2 つに書くと見た目がずれる）。押せる高さは 44px（指で押せる大きさ）。
export default function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <p style={{ margin: "14px 0 0", textAlign: "right" }}>
      <a
        href={href}
        style={{
          fontFamily: FONT_SANS,
          fontSize: 13,
          color: JB.navy,
          textDecoration: "none",
          borderBottom: `1px solid ${JB.navy}`,
          paddingBottom: 2,
          minHeight: 44,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {children}
      </a>
    </p>
  );
}
