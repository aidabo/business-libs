// A Ghost post as the news surfaces read it. Kept field-for-field identical to
// the host's `Post` (apps/host/src/types/post.ts) so either is assignable to the
// other; change both together.
export interface NewsPost {
  id: string;
  uuid: string;
  type: "image" | "video" | "audio" | "file" | "text";
  src: string | null;
  //video thumbnail or image url
  displayUrl: any;
  title: string;
  slug: string;
  html: string | null;
  lexical: string;
  feature_image: string | null;
  featured: boolean;
  status: string;
  visibility?: string;
  tiers?: Array<Record<string, unknown>>;
  access_denied?: boolean;
  created_at: string;
  updated_at: string;
  published_at: string;
  excerpt: string | null;
  related_date: string | null;
  related_events: string | null;
  reading_time: number | null;
  group_id: string | null;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
    classification?: string | null;
  }>;
  count: {
    bookmarks: number;
    favors: number;
    forwards: number;
    comments: number;
    clicks: number;
    positive_feedback: number;
    negative_feedback: number;
  };
  primary_author: {
    id: string;
    name: string;
    slug: string;
    profile_image: string | null;
    url: any;
  };
  primary_tag: {
    id: string;
    name: string;
    slug: string;
    feature_image: string | null;
    url: any;
  };
  url: string;
}
