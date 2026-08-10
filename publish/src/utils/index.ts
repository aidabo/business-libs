export const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateShort = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const truncateText = (text: string, maxLength = 150): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
};

export const getContentTypeColor = (contentType: string): string => {
  const colors: Record<string, string> = {
    news: 'blue',
    government: 'emerald',
    publication: 'purple',
    comic: 'orange',
    entertainment: 'pink',
  };
  return colors[contentType] || 'gray';
};

/**
 * Page Builder bindings can provide a scalar, a JSON string, or a Ghost-style
 * object list where the component contract expects string labels. Normalize at
 * the package boundary so presentation components never call `.map` on a
 * non-array value.
 */
export const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>;
          return String(record.name ?? record.label ?? record.slug ?? '').trim();
        }
        return String(item ?? '').trim();
      })
      .filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return toStringArray(parsed);
    } catch {
      // Treat a plain scalar as one label rather than throwing during render.
    }
    return [value.trim()];
  }
  return [];
};
