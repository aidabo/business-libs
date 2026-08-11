export interface PublishingPageWidget {
  id?: string;
  content?: string;
  [key: string]: any;
}

export const PUBLISHING_DATASOURCE_IDS = {
  public: 'host-publish-content-public',
  search: 'host-publish-content-search',
  detail: 'host-publish-content-detail',
} as const;

export type PublishingPageRecipe = {
  id: string;
  label: string;
  description: string;
  vertical: 'news' | 'government' | 'publication' | 'comic' | 'entertainment' | 'magazine';
  requiredComponents: string[];
  optionalComponents: string[];
};

export const PUBLISHING_PAGE_RECIPES: PublishingPageRecipe[] = [
  { id: 'publish-home', label: 'Publishing Home', description: 'News and publishing home with search, sections, feed, and detail navigation.', vertical: 'news', requiredComponents: ['HeroBanner', 'SectionNav', 'ContentGrid', 'ContentFeed', 'ContentDetail'], optionalComponents: ['BreakingNews', 'FeaturedContent', 'RelatedArticles'] },
  { id: 'publish-newspaper', label: 'Newspaper', description: 'Editorial newspaper front page with lead story, briefs, and sections.', vertical: 'news', requiredComponents: ['NewspaperHeader', 'LeadStory', 'PrimaryArticleCard', 'SecondaryArticleCard', 'BriefItem', 'SectionHeader'], optionalComponents: ['EditorialCard', 'PullQuote'] },
  { id: 'publish-government', label: 'Government Portal', description: 'Public information portal for documents, services, schedules, and alerts.', vertical: 'government', requiredComponents: ['AnnouncementBanner', 'GovernmentServiceNav', 'DocumentList', 'DocumentCard'], optionalComponents: ['ApplicationGuide', 'CouncilSchedule', 'EmergencyAlert'] },
  { id: 'publish-publication', label: 'Publication Catalog', description: 'Books and publication catalog with author, series, review, and reader detail.', vertical: 'publication', requiredComponents: ['HeroBanner', 'PublicationGrid', 'PublicationCard', 'ContentDetail'], optionalComponents: ['AuthorProfile', 'SeriesCard', 'ReviewCard', 'RankingBoard', 'VerticalArticleCard', 'WritingModeToggle'] },
  { id: 'publish-comic', label: 'Manga / Series', description: 'Series browser and reader flow for manga and comic content.', vertical: 'comic', requiredComponents: ['SeriesList', 'SeriesHeader', 'ChapterList', 'ComicReader'], optionalComponents: ['RankingBoard', 'RelatedArticles'] },
  { id: 'publish-events', label: 'Events Calendar', description: 'Event discovery page with date/category filters, calendar, and schedule.', vertical: 'entertainment', requiredComponents: ['EventFilterBar', 'EventCalendar', 'EventCard', 'ScheduleList'], optionalComponents: ['VenueCard', 'FeaturedContent'] },
];

const ARRAY_BINDINGS: Record<string, {prop: string; sourceId: string}> = {
  BreakingNews: {prop: 'items', sourceId: PUBLISHING_DATASOURCE_IDS.public},
  ContentFeed: {prop: 'items', sourceId: PUBLISHING_DATASOURCE_IDS.public},
  LatestUpdates: {prop: 'items', sourceId: PUBLISHING_DATASOURCE_IDS.public},
  ContentGrid: {prop: 'contents', sourceId: PUBLISHING_DATASOURCE_IDS.search},
  PublicationGrid: {prop: 'publications', sourceId: PUBLISHING_DATASOURCE_IDS.search},
  DocumentList: {prop: 'documents', sourceId: PUBLISHING_DATASOURCE_IDS.search},
  EventCalendar: {prop: 'events', sourceId: PUBLISHING_DATASOURCE_IDS.search},
  SeriesList: {prop: 'series', sourceId: PUBLISHING_DATASOURCE_IDS.search},
  ChapterList: {prop: 'chapters', sourceId: PUBLISHING_DATASOURCE_IDS.search},
  RelatedArticles: {prop: 'articles', sourceId: PUBLISHING_DATASOURCE_IDS.search},
};

const selectionInteractions = (componentName: string) => [
  {
    id: `${componentName}-select-state`,
    event: 'select',
    action: 'set-shared-state',
    targetPath: 'publish.selectedContentId',
    valueFrom: '$.id',
    enabled: true,
  },
  {
    id: `${componentName}-select-event`,
    event: 'select',
    action: 'emit-event',
    targetPath: 'publish:content:selected',
    valueFrom: '$',
    enabled: true,
  },
];

const SELECTING_COMPONENTS = new Set([
  'ContentCard',
  'ContentGrid',
  'ContentFeed',
  'PublicationGrid',
  'DocumentList',
  'EventCalendar',
  'ChapterList',
  'SeriesList',
  'RelatedArticles',
  'VerticalArticleCard',
]);

const interactionsFor = (componentName: string) => {
  if (SELECTING_COMPONENTS.has(componentName)) {
    return selectionInteractions(componentName);
  }
  if (componentName === 'HeroBanner') {
    return [
      {
        id: 'HeroBanner-search-state',
        event: 'search',
        action: 'set-shared-state',
        targetPath: 'publish.searchQuery',
        valueFrom: '$.keyword',
        enabled: true,
      },
      {
        id: 'HeroBanner-search-event',
        event: 'search',
        action: 'emit-event',
        targetPath: 'publish:search:changed',
        valueFrom: '$',
        enabled: true,
      },
    ];
  }
  if (componentName === 'SectionNav') {
    return [
      {
        id: 'SectionNav-section-state',
        event: 'section-change',
        action: 'set-shared-state',
        targetPath: 'publish.activeSection',
        valueFrom: '$.section',
        enabled: true,
      },
      {
        id: 'SectionNav-section-event',
        event: 'section-change',
        action: 'emit-event',
        targetPath: 'publish:section:changed',
        valueFrom: '$',
        enabled: true,
      },
    ];
  }
  if (componentName === 'EventFilterBar') {
    return [
      {
        id: 'EventFilterBar-search-state',
        event: 'search',
        action: 'set-shared-state',
        targetPath: 'publish.searchQuery',
        valueFrom: '$.keyword',
        enabled: true,
      },
      {
        id: 'EventFilterBar-category-state',
        event: 'filter-change',
        action: 'set-shared-state',
        targetPath: 'publish.activeSection',
        valueFrom: '$.category',
        enabled: true,
      },
    ];
  }
  if (componentName === 'ComicReader') {
    return [
      {
        id: 'ComicReader-page-event',
        event: 'page-change',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$',
        enabled: true,
      },
    ];
  }
  return [];
};

const mergeInteractions = (current: any[], defaults: any[]) => {
  const currentIds = new Set(current.map((rule) => String(rule?.id || '')));
  return [
    ...current,
    ...defaults.filter((rule) => !currentIds.has(String(rule.id))),
  ];
};

export const wirePublishingLayout = <T extends PublishingPageWidget>(layout: T[]): T[] =>
  layout.map((node) => {
    if (!node.content) {
      throw new Error(`Publishing widget ${node.id || 'unknown'} is missing content`);
    }

    let parsed: {name?: string; props?: Record<string, any>};
    try {
      parsed = JSON.parse(String(node.content));
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Publishing widget ${node.id || 'unknown'} contains invalid JSON: ${reason}`,
      );
    }

    const name = String(parsed.name || '').trim();
    if (!name) {
      throw new Error(`Publishing widget ${node.id || 'unknown'} is missing a component name`);
    }

    const props = {...(parsed.props || {})};
    const binding = ARRAY_BINDINGS[name];
    if (binding) {
      props.__bindings = {
        ...(props.__bindings || {}),
        [binding.prop]: {
          sourceId: binding.sourceId,
          path: '$.items',
          targetType: 'array',
          selector: {type: 'all'},
        },
      };
    }

    const interactions = mergeInteractions(
      Array.isArray(props.__interactions) ? props.__interactions : [],
      interactionsFor(name),
    );
    if (interactions.length > 0) {
      props.__interactions = interactions;
    }

    return {
      ...node,
      content: JSON.stringify({...parsed, name, props}),
    } as T;
  });

const datasourceIdsUsedBy = (layout: PublishingPageWidget[]) => {
  const ids = new Set<string>();
  for (const node of layout) {
    const parsed = JSON.parse(String(node.content || '{}'));
    for (const value of Object.values(parsed.props?.__bindings || {}) as any[]) {
      if (value?.sourceId) ids.add(String(value.sourceId));
    }
  }
  return ids;
};

export const createPublishingPageSource = (layout: PublishingPageWidget[]) => {
  const usedIds = datasourceIdsUsedBy(layout);
  const dataSources = [
    {
      id: PUBLISHING_DATASOURCE_IDS.search,
      name: 'Publishing Content (Search)',
      description: 'Search Publishing content using editable page state.',
      type: 'host-function',
      category: 'publish-content',
      tags: ['publish', 'content', 'search'],
      icon: 'search',
      wrapperKey: 'publishContent',
      parameters: {
        keyword: '{{state.publish.searchQuery}}',
        section: '{{state.publish.activeSection}}',
        contentType: '',
        limit: 20,
      },
    },
    {
      id: PUBLISHING_DATASOURCE_IDS.public,
      name: 'Publishing Content (Public)',
      description: 'Latest published content for feeds and tickers.',
      type: 'host-function',
      category: 'publish-content',
      tags: ['publish', 'content', 'public'],
      icon: 'newspaper',
      wrapperKey: 'publishContent',
      parameters: {limit: 12, page: 1, filter: 'status:published'},
    },
  ].filter((source) => usedIds.has(source.id));

  return {lists: [], dataSources};
};

export const createPublishingPageState = (
  current: Record<string, any> = {},
) => ({
  ...current,
  'publish.selectedContentId':
    current['publish.selectedContentId'] ?? current.selectedId ?? '',
  'publish.searchQuery':
    current['publish.searchQuery'] ?? current.keyword ?? '',
  'publish.activeSection': current['publish.activeSection'] ?? '',
  'publish.contentTypeFilter': current['publish.contentTypeFilter'] ?? 'all',
  'publish.viewMode': current['publish.viewMode'] ?? 'grid',
});
