import type { PublishContent, Section, Publication, ComicChapter, Event, Document } from '../types';

// Publish API client layer — wire to Ghost Content API or custom publish endpoints

export const fetchContents = async (_params?: {
  contentType?: string;
  section?: string;
  limit?: number;
  featured?: boolean;
  query?: string;
}): Promise<{ contents: PublishContent[] }> => {
  return { contents: [] };
};

export const fetchContent = async (_id: string): Promise<PublishContent | null> => {
  return null;
};

export const fetchSections = async (): Promise<{ sections: Section[] }> => {
  return { sections: [] };
};

export const fetchPublications = async (_params?: {
  publisher?: string;
  format?: string;
  limit?: number;
}): Promise<{ publications: Publication[] }> => {
  return { publications: [] };
};

export const fetchChapters = async (_seriesId: string): Promise<{ chapters: ComicChapter[] }> => {
  return { chapters: [] };
};

export const fetchEvents = async (_params?: {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}): Promise<{ events: Event[] }> => {
  return { events: [] };
};

export const fetchDocuments = async (_params?: {
  issuingAuthority?: string;
  documentType?: string;
  limit?: number;
}): Promise<{ documents: Document[] }> => {
  return { documents: [] };
};
