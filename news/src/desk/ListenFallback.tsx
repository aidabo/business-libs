// ホストがカードの音声プレーヤー（adapter.AudioCard）を渡さないときの代わり — ブラウザの標準の操作。
export default function ListenFallback({ src }: { src: string }) {
  return <audio src={src} controls preload="none" style={{ width: "100%", display: "block" }} />;
}
