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
