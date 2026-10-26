import { useNews } from "../adapter/NewsContext";
import ListenFallback from "./ListenFallback";

/** カードの中の音声。ホストの AudioCard（adapter）があればそれ、無ければブラウザの標準の操作。 */
export default function DeskAudio(props: { src: string; title?: string; playOnHeaderClick?: boolean }) {
  const { AudioCard } = useNews().adapter;
  return AudioCard ? <AudioCard {...props} /> : <ListenFallback src={props.src} />;
}
