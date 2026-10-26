// The media summary the desk and the host share (moved from apps/host/src/lib/mediaUtils.ts,
// which re-exports these).
export interface MediaInfo {
  type: "image" | "video" | "audio" | "file" | "text";
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  caption?: string;
  alt?: string;
  duration?: number;
  mimeType?: string;
  fileName?: string;
  fileSize?: number;
}

/**
 * Gets the display URL for media (updated with audio support)
 */
export function getDisplayUrl(mediaInfo: MediaInfo | null): string | null {
  if (!mediaInfo) return null;

  if (mediaInfo.type === "video" && mediaInfo.thumbnailUrl) {
    return mediaInfo.thumbnailUrl;
  }

  // For audio, we might want to use a placeholder image or waveform
  // You can customize this based on your needs
  if (mediaInfo.type === "audio") {
    // Return a waveform placeholder or audio icon
    // You might want to generate waveform images or use a default audio icon
    return "/images/audio-placeholder.png"; // Customize this path
  }

  return mediaInfo.url;
}
