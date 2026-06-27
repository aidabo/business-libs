import ContentCard from './ContentCard';
import ContentGrid from './ContentGrid';
import HeroBanner from './HeroBanner';
import SectionNav from './SectionNav';
import BreakingNews from './BreakingNews';
import FeaturedContent from './FeaturedContent';
import ContentDetail from './ContentDetail';
import LatestUpdates from './LatestUpdates';
import SubscriptionForm from './SubscriptionForm';
import ContentFeed from './ContentFeed';
import PublicationCard from './PublicationCard';
import PublicationGrid from './PublicationGrid';
import EventCard from './EventCard';
import ComicReader from './ComicReader';
import ChapterList from './ChapterList';
import SeriesHeader from './SeriesHeader';
import SeriesList from './SeriesList';
import DocumentCard from './DocumentCard';
import DocumentList from './DocumentList';
import ApplicationGuide from './ApplicationGuide';
import CouncilSchedule from './CouncilSchedule';
import EmergencyAlert from './EmergencyAlert';
import GovernmentServiceNav from './GovernmentServiceNav';
import AnnouncementBanner from './AnnouncementBanner';
import AuthorProfile from './AuthorProfile';
import ReviewCard from './ReviewCard';
import SeriesCard from './SeriesCard';
import RankingBoard from './RankingBoard';
import NewsArticleCard from './NewsArticleCard';
import EventCalendar from './EventCalendar';
import TicketCard from './TicketCard';
import VenueCard from './VenueCard';
import ScheduleList from './ScheduleList';
import EventFilterBar from './EventFilterBar';
import BookCard from './BookCard';
import VerticalArticle from './VerticalArticle';
import WritingModeToggle from './WritingModeToggle';
import RelatedArticles from './RelatedArticles';
import NewspaperHeader from './NewspaperHeader';
import LeadStory from './LeadStory';
import PrimaryArticleCard from './PrimaryArticleCard';
import SecondaryArticleCard from './SecondaryArticleCard';
import BriefItem from './BriefItem';
import EditorialCard from './EditorialCard';
import SectionHeader from './SectionHeader';
import PullQuote from './PullQuote';
import { PublishProvider } from './contexts/PublishContext';

// Map for ComponentsProvider (page builder registration)
export const PublishComponents = {
  ContentCard,
  ContentGrid,
  HeroBanner,
  SectionNav,
  BreakingNews,
  FeaturedContent,
  ContentDetail,
  LatestUpdates,
  SubscriptionForm,
  ContentFeed,
  PublicationCard,
  PublicationGrid,
  EventCard,
  ComicReader,
  ChapterList,
  SeriesHeader,
  SeriesList,
  DocumentCard,
  DocumentList,
  ApplicationGuide,
  CouncilSchedule,
  EmergencyAlert,
  GovernmentServiceNav,
  AnnouncementBanner,
  AuthorProfile,
  ReviewCard,
  SeriesCard,
  RankingBoard,
  NewsArticleCard,
  EventCalendar,
  TicketCard,
  VenueCard,
  ScheduleList,
  EventFilterBar,
  BookCard,
  VerticalArticle,
  WritingModeToggle,
  RelatedArticles,
  NewspaperHeader,
  LeadStory,
  PrimaryArticleCard,
  SecondaryArticleCard,
  BriefItem,
  EditorialCard,
  SectionHeader,
  PullQuote,
  PublishProvider,
};

// Map for componentPropsProvider (default props for each component)
export const PublishDefaultProps = {
  ContentCard: {
    _componentDesc: 'Content card with image and excerpt',
    title: 'Markets Hit All-Time High as Economy Surges',
    excerpt: 'Global markets reached unprecedented levels driven by strong consumer spending and corporate earnings.',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    contentType: 'news',
    category: 'Business',
    author: 'Jane Doe',
    publishedAt: 'May 22, 2026',
    selectedContentIdKey: 'publish.selectedContentId',
    __schema: {
      type: 'object',
      title: 'ContentCard',
      properties: {
        title: { type: 'string', title: 'Title' },
        excerpt: { type: 'string', title: 'Excerpt', 'x-widget': 'textarea' },
        image: { type: 'string', title: 'Image URL', format: 'uri', 'x-media-type': 'image' },
        contentType: { type: 'string', title: 'Type', enum: ['news', 'government', 'publication', 'comic', 'entertainment'] },
        category: { type: 'string', title: 'Category' },
        author: { type: 'string', title: 'Author' },
        publishedAt: { type: 'string', title: 'Date' },
        featured: { type: 'boolean', title: 'Featured' },
      },
    },
    __interactions: [
      {
        id: 'content-card-select-state',
        event: 'select',
        action: 'set-shared-state',
        targetPath: 'publish.selectedContentId',
        valueFrom: '$.id',
        enabled: true,
      },
      {
        id: 'content-card-select-event',
        event: 'select',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$',
        enabled: true,
      },
    ],
  },
  ContentGrid: {
    _componentDesc: 'Content grid with configurable columns',
    title: 'Latest Content',
    description: 'Browse our latest articles, publications, and updates.',
    columns: 3,
    selectedContentIdKey: 'publish.selectedContentId',
    contents: [
      {
        id: '1', title: 'City Council Approves 2027 Budget', excerpt: 'New budget focuses on infrastructure and education.',
        contentType: 'government', category: 'Local Gov', author: 'City Press', publishedAt: 'May 22, 2026',
        featured: true, image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop',
      },
      {
        id: '2', title: 'New Manga Series Tops Charts', excerpt: 'The debut chapter has garnered over 1 million reads in its first week.',
        contentType: 'comic', category: 'Manga', author: 'Manga Weekly', publishedAt: 'May 21, 2026',
        image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=400&fit=crop',
      },
      {
        id: '3', title: 'Summer Festival 2026 Announced', excerpt: 'Three-day event featuring live music, food stalls, and fireworks.',
        contentType: 'entertainment', category: 'Events', author: 'Event Guide', publishedAt: 'May 20, 2026',
        image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
      },
      {
        id: '4', title: 'Best-Selling Novel of the Year', excerpt: 'The gripping thriller has sold over 500,000 copies worldwide.',
        contentType: 'publication', category: 'Books', author: 'Lit Review', publishedAt: 'May 19, 2026',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=400&fit=crop',
      },
    ],
    __schema: {
      type: 'object',
      title: 'ContentGrid',
      properties: {
        title: { type: 'string', title: 'Title' },
        description: { type: 'string', title: 'Description' },
        columns: { type: 'number', title: 'Columns', enum: [1, 2, 3, 4] },
        contentTypeFilter: { type: 'string', title: 'Filter Type', enum: ['all', 'news', 'government', 'publication', 'comic', 'entertainment'] },
      },
    },
    __interactions: [
      {
        id: 'grid-select-state',
        event: 'select',
        action: 'set-shared-state',
        targetPath: 'publish.selectedContentId',
        valueFrom: '$.id',
        enabled: true,
      },
      {
        id: 'grid-select-event',
        event: 'select',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$',
        enabled: true,
      },
    ],
  },
  HeroBanner: {
    _componentDesc: 'Hero banner with search and CTA',
    title: 'The Daily Chronicle',
    subtitle: 'Your trusted source for news, analysis, and insights across publishing, government, and entertainment.',
    backgroundImage: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    showSearch: true,
    searchPlaceholder: 'Search articles, publications, events...',
    keywordKey: 'publish.searchQuery',
    __schema: {
      type: 'object',
      title: 'HeroBanner',
      properties: {
        title: { type: 'string', title: 'Title' },
        subtitle: { type: 'string', title: 'Subtitle' },
        backgroundImage: { type: 'string', title: 'Background Image', format: 'uri', 'x-media-type': 'image' },
        showSearch: { type: 'boolean', title: 'Show Search' },
        searchPlaceholder: { type: 'string', title: 'Search Placeholder' },
        badgeText: { type: 'string', title: 'Badge Text' },
        badgeColor: { type: 'string', title: 'Badge Color' },
        ctaText: { type: 'string', title: 'CTA Button Text' },
      },
    },
    __interactions: [
      {
        id: 'hero-search-state',
        event: 'search',
        action: 'set-shared-state',
        targetPath: 'publish.searchQuery',
        valueFrom: '$.keyword',
        enabled: true,
      },
      {
        id: 'hero-search-event',
        event: 'search',
        action: 'emit-event',
        targetPath: 'publish:search:changed',
        valueFrom: '$',
        enabled: true,
      },
    ],
  },
  SectionNav: {
    _componentDesc: 'Section navigation with content filters',
    sections: [
      { id: '1', name: 'News', slug: 'news', icon: '📰', contentType: 'news', count: 120 },
      { id: '2', name: 'Government', slug: 'government', icon: '🏛️', contentType: 'government', count: 45 },
      { id: '3', name: 'Books', slug: 'publication', icon: '📚', contentType: 'publication', count: 78 },
      { id: '4', name: 'Manga', slug: 'comic', icon: '🎨', contentType: 'comic', count: 56 },
      { id: '5', name: 'Events', slug: 'entertainment', icon: '🎪', contentType: 'entertainment', count: 34 },
    ],
    keywordKey: 'publish.activeSection',
    __schema: {
      type: 'object',
      title: 'SectionNav',
      properties: {
        activeSection: { type: 'string', title: 'Active Section' },
        showCounts: { type: 'boolean', title: 'Show Counts' },
      },
    },
    __interactions: [
      {
        id: 'section-change-state',
        event: 'section-change',
        action: 'set-shared-state',
        targetPath: 'publish.activeSection',
        valueFrom: '$.section',
        enabled: true,
      },
      {
        id: 'section-change-event',
        event: 'section-change',
        action: 'emit-event',
        targetPath: 'publish:section:changed',
        valueFrom: '$',
        enabled: true,
      },
    ],
  },
  BreakingNews: {
    _componentDesc: 'Breaking news ticker',
    label: 'BREAKING',
    interval: 5000,
    items: [
      { id: '1', title: 'Global summit concludes with historic climate agreement' },
      { id: '2', title: 'City announces new public transportation initiative' },
      { id: '3', title: 'Major publishing merger reshapes industry landscape' },
    ],
  },
  FeaturedContent: {
    _componentDesc: 'Featured article card',
    title: 'The Future of Digital Publishing: A Comprehensive Analysis',
    excerpt: 'How digital transformation is reshaping newspapers, magazines, and the entire publishing industry.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    category: 'Industry',
    author: 'Dr. Michael Chen',
    publishedAt: 'May 22, 2026',
    badgeText: 'EXCLUSIVE',
    secondaryAction: 'Read More',
  },
  ContentDetail: {
    _componentDesc: 'Content detail view',
    title: 'The Future of Digital Publishing',
    content: '<p>Digital transformation continues to reshape the publishing landscape. From AI-assisted content creation to personalized reader experiences, the industry is evolving at an unprecedented pace.</p><p>Traditional publishers are adapting by embracing digital-first strategies, while new players leverage technology to reach audiences in innovative ways.</p>',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    category: 'Industry',
    author: 'Dr. Michael Chen',
    publishedAt: 'May 22, 2026',
    tags: ['publishing', 'digital', 'innovation', 'media'],
    publisher: 'Chronicle Books',
    isbn: '978-0-123456-78-9',
    pageCount: 320,
    price: '$24.99',
  },
  LatestUpdates: {
    _componentDesc: 'Timeline update list',
    title: 'Latest Updates',
    maxItems: 10,
    items: [
      { id: '1', title: 'Stock markets reach new milestones amid economic recovery', publishedAt: '2h ago', category: 'Business' },
      { id: '2', title: 'New study reveals breakthrough in cancer research', publishedAt: '3h ago', category: 'Health' },
      { id: '3', title: 'City council approves major infrastructure project', publishedAt: '5h ago', category: 'Government' },
      { id: '4', title: 'Popular manga series announces anime adaptation', publishedAt: '6h ago', category: 'Comic' },
      { id: '5', title: 'Summer music festival lineup revealed', publishedAt: '8h ago', category: 'Entertainment' },
    ],
    showViewAll: true,
  },
  SubscriptionForm: {
    _componentDesc: 'Email subscription form',
    title: 'Subscribe to Our Newsletter',
    description: 'Get the latest updates delivered to your inbox every morning.',
    placeholder: 'Enter your email',
    buttonLabel: 'Subscribe',
    interestCategories: [
      { id: 'news', label: 'News' },
      { id: 'government', label: 'Government' },
      { id: 'publication', label: 'Books' },
      { id: 'comic', label: 'Manga' },
      { id: 'entertainment', label: 'Events' },
    ],
    variant: 'inline',
  },
  ContentFeed: {
    _componentDesc: 'Timeline feed with date groups',
    title: 'Latest Updates',
    description: 'Timeline of recent news and events.',
    maxItems: 5,
    items: [
      { id: '1', title: 'Market opens higher on positive economic data', publishedAt: '9:00 AM', summary: 'Major indices up 1.2% in early trading.', category: 'Business', contentType: 'news' },
      { id: '2', title: 'New environmental regulations announced', publishedAt: '8:30 AM', summary: 'Government unveils comprehensive climate action plan.', category: 'Politics', contentType: 'government' },
      { id: '3', title: 'Bestseller list: Fiction dominates this month', publishedAt: '8:00 AM', summary: 'Five new titles enter the top ten.', category: 'Books', contentType: 'publication' },
    ],
    groupByDate: true,
  },
  PublicationCard: {
    _componentDesc: 'Book card with rating badge',
    title: 'The Great Adventure',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    author: 'John Smith',
    publisher: 'Chronicle Books',
    format: 'Hardcover',
    price: '$24.99',
    description: 'An epic journey through uncharted territories.',
  },
  PublicationGrid: {
    _componentDesc: 'Publication card grid',
    title: 'Featured Publications',
    publications: [
      { id: '1', title: 'The Great Adventure', coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop', author: 'John Smith', publisher: 'Chronicle Books', format: 'Hardcover', price: '$24.99' },
      { id: '2', title: 'Digital Horizons', coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop', author: 'Emily Chen', publisher: 'Tech Press', format: 'Paperback', price: '$18.99' },
      { id: '3', title: 'The Art of Manga', coverImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=300&fit=crop', author: 'Yuki Tanaka', publisher: 'Manga Arts', format: 'Paperback', price: '$15.99' },
    ],
    columns: 2,
  },
  EventCard: {
    _componentDesc: 'Event card with date and price',
    title: 'Summer Music Festival 2026',
    description: 'Three-day outdoor music festival featuring top international artists.',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    startDate: '2026-07-15',
    endDate: '2026-07-17',
    location: 'Central Park, New York',
    category: 'Music',
    price: '$150',
  },
  ComicReader: {
    _componentDesc: 'Enhanced manga/comic/webtoon reader with paged and vertical-scroll modes',
    __componentSpec: 'component.comicReader.desc',
    title: 'Sample Chapter',
    pages: [
      'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&h=800&fit=crop',
    ],
    readingDirection: 'rtl',
    mode: 'paged',
    enableKeyboardNav: true,
    showPageIndicator: true,
    bookmarks: [],
    spreadMode: false,
    showThumbnails: false,
    __schema: {
      type: 'object',
      title: 'ComicReader',
      properties: {
        title: { type: 'string', title: 'Title' },
        pages: { type: 'array', title: 'Pages', items: { type: 'string', format: 'uri', 'x-media-type': 'image' } },
        readingDirection: { type: 'string', title: 'Direction', enum: ['ltr', 'rtl', 'vertical'] },
        mode: { type: 'string', title: 'Mode', enum: ['paged', 'webtoon'] },
        enableKeyboardNav: { type: 'boolean', title: 'Keyboard Nav' },
        showPageIndicator: { type: 'boolean', title: 'Progress Bar' },
        spreadMode: { type: 'boolean', title: 'Spread/Double-Page View' },
        showThumbnails: { type: 'boolean', title: 'Thumbnail Strip' },
      },
    },
    __interactions: [
      {
        id: 'comic-page-select',
        event: 'page-change',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$.id',
        enabled: true,
      },
    ],
  },
  ChapterList: {
    _componentDesc: 'Chapter list with reading progress',
    __componentSpec: 'component.chapterList.desc',
    seriesName: 'Dragon Saga',
    chapters: [
      { id: 'ch-1', chapterNumber: 1, title: 'The Beginning', pageCount: 24, publishedAt: 'May 1, 2026' },
      { id: 'ch-2', chapterNumber: 2, title: 'The Awakening', pageCount: 28, publishedAt: 'May 8, 2026' },
      { id: 'ch-3', chapterNumber: 3, title: 'The Journey', pageCount: 32, publishedAt: 'May 15, 2026' },
    ],
    currentChapter: 2,
  },
  SeriesHeader: {
    _componentDesc: 'Manga/comic series detail header with cover, metadata, genres, and synopsis',
    __componentSpec: 'component.seriesHeader.desc',
    title: 'Dragon Saga',
    coverImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=600&fit=crop',
    author: 'Yuki Tanaka',
    genres: ['Fantasy', 'Action', 'Adventure'],
    rating: 4.5,
    synopsis: 'In a world where ancient dragons have returned, a young hero must embark on a perilous journey to uncover the truth behind a forgotten prophecy. Along the way, they forge alliances, face formidable foes, and discover the strength within.',
    status: 'ongoing',
    chapterCount: 47,
    latestChapter: 'Ch. 47: The Final Trial',
    isBookmarked: false,
    __schema: {
      type: 'object',
      title: 'SeriesHeader',
      properties: {
        title: { type: 'string', title: 'Series Title' },
        coverImage: { type: 'string', title: 'Cover Image URL', format: 'uri', 'x-media-type': 'image' },
        author: { type: 'string', title: 'Author' },
        artist: { type: 'string', title: 'Artist (manga)' },
        genres: { type: 'array', title: 'Genres', items: { type: 'string' } },
        rating: { type: 'number', title: 'Rating (1-5)', minimum: 0, maximum: 5 },
        synopsis: { type: 'string', title: 'Synopsis', 'x-widget': 'textarea' },
        status: { type: 'string', title: 'Status', enum: ['ongoing', 'completed', 'hiatus', 'cancelled'] },
        chapterCount: { type: 'number', title: 'Chapter Count' },
        isBookmarked: { type: 'boolean', title: 'Bookmarked' },
      },
    },
    __interactions: [
      {
        id: 'series-header-bookmark',
        event: 'bookmark-toggle',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$.id',
        enabled: true,
      },
    ],
  },
  SeriesList: {
    _componentDesc: 'Manga/comic series catalog grid with search, genre filter, and favorites',
    __componentSpec: 'component.seriesList.desc',
    title: 'Series',
    columns: 4,
    showSearch: true,
    showFilter: true,
    searchPlaceholder: 'Search series...',
    series: [
      {
        id: 's1', title: 'Dragon Saga', coverImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=600&fit=crop',
        author: 'Yuki Tanaka', genres: ['Fantasy', 'Action'], rating: 4.5, status: 'ongoing', chapterCount: 47, updatedAt: '2026-06-26',
      },
      {
        id: 's2', title: 'Shadow Realm', coverImage: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=600&fit=crop',
        author: 'Satoshi Yamamoto', genres: ['Dark Fantasy', 'Supernatural'], rating: 4.3, status: 'ongoing', chapterCount: 32, updatedAt: '2026-06-24',
      },
      {
        id: 's3', title: 'Star Academy', coverImage: 'https://images.unsplash.com/photo-1535665279445-5f5bb0e1e6b9?w=400&h=600&fit=crop',
        author: 'Minji Park', genres: ['School', 'Sci-Fi'], rating: 4.1, status: 'completed', chapterCount: 86, updatedAt: '2026-05-30',
      },
      {
        id: 's4', title: 'Neon Streets', coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop',
        author: 'Wei Chen', genres: ['Cyberpunk', 'Action', 'Thriller'], rating: 4.7, status: 'ongoing', chapterCount: 58, updatedAt: '2026-06-25',
      },
      {
        id: 's5', title: 'Spirit Tales', coverImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=600&fit=crop',
        author: 'Hana Kim', genres: ['Folklore', 'Adventure'], rating: 4.0, status: 'hiatus', chapterCount: 24, updatedAt: '2026-04-15',
      },
      {
        id: 's6', title: 'Chrono Academy', coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
        author: 'Taro Suzuki', genres: ['Time Travel', 'School', 'Romance'], rating: 4.4, status: 'ongoing', chapterCount: 39, updatedAt: '2026-06-22',
      },
    ],
    __schema: {
      type: 'object',
      title: 'SeriesList',
      properties: {
        title: { type: 'string', title: 'Section Title' },
        columns: { type: 'number', title: 'Columns', enum: [2, 3, 4, 5, 6] },
        showSearch: { type: 'boolean', title: 'Show Search Bar' },
        showFilter: { type: 'boolean', title: 'Show Genre Filter' },
        searchPlaceholder: { type: 'string', title: 'Search Placeholder' },
        maxItems: { type: 'number', title: 'Max Items (0 = all)' },
      },
    },
    __interactions: [
      {
        id: 'series-list-select-state',
        event: 'select',
        action: 'set-shared-state',
        targetPath: 'publish.selectedContentId',
        valueFrom: '$.id',
        enabled: true,
      },
      {
        id: 'series-list-select-event',
        event: 'select',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$',
        enabled: true,
      },
    ],
  },
  DocumentCard: {
    _componentDesc: 'Document card with urgency flag',
    title: '2026 Annual Budget Report',
    issuingAuthority: 'City Finance Department',
    documentDate: 'May 15, 2026',
    documentType: 'PDF',
    fileSize: '2.4 MB',
    description: 'Comprehensive annual budget breakdown including revenue projections and expenditure allocations.',
    urgent: false,
  },
  DocumentList: {
    _componentDesc: 'Searchable/filterable document listing for government portals',
    title: 'Documents & Publications',
    description: 'Browse official documents, reports, and publications.',
    showSearch: true,
    searchPlaceholder: 'Search documents...',
    showCategoryFilter: true,
    categories: ['Budget', 'Ordinance', 'Report', 'Notice'],
    maxItems: 20,
    documents: [
      { id: 'd1', title: '2026 Annual Budget Report', issuingAuthority: 'City Finance Department', documentDate: 'May 15, 2026', documentType: 'PDF', fileSize: '2.4 MB', category: 'Budget' },
      { id: 'd2', title: 'Urban Development Plan 2026-2030', issuingAuthority: 'Urban Planning Bureau', documentDate: 'May 10, 2026', documentType: 'PDF', fileSize: '4.1 MB', category: 'Report' },
      { id: 'd3', title: 'Emergency Evacuation Procedures Update', issuingAuthority: 'Public Safety Office', documentDate: 'May 5, 2026', documentType: 'PDF', fileSize: '1.2 MB', urgent: true, category: 'Ordinance' },
    ],
    __schema: {
      type: 'object',
      title: 'DocumentList',
      properties: {
        title: { type: 'string', title: 'Title' },
        description: { type: 'string', title: 'Description' },
        showSearch: { type: 'boolean', title: 'Show Search' },
        showCategoryFilter: { type: 'boolean', title: 'Show Category Filter' },
        maxItems: { type: 'number', title: 'Max Items' },
      },
    },
    __interactions: [
      { id: 'doc-list-select-state', event: 'select', action: 'set-shared-state', targetPath: 'publish.selectedContentId', valueFrom: '$.id', enabled: true },
      { id: 'doc-list-select-event', event: 'select', action: 'emit-event', targetPath: 'publish:content:selected', valueFrom: '$', enabled: true },
    ],
  },
  ApplicationGuide: {
    _componentDesc: 'Application procedure guide card for government services',
    title: 'Application Guide',
    procedureName: 'Residence Certificate Application',
    description: 'How to apply for a residence certificate (住民票) at your local municipal office.',
    steps: [
      { step: 1, label: 'Prepare Required Documents', description: 'Bring your identification and any supporting documents.' },
      { step: 2, label: 'Visit Your Local Office', description: 'Go to the市民課 (Citizen Affairs Section) during business hours.' },
      { step: 3, label: 'Fill Out Application Form', description: 'Complete the application form at the counter.' },
      { step: 4, label: 'Receive Your Certificate', description: 'Payment is collected upon issuance.' },
    ],
    requiredDocuments: ['Government-issued photo ID (passport, driver\'s license)', 'Residence card or health insurance card', 'Application form (available at counter)'],
    office: 'City Hall, 2F Citizen Affairs Section',
    hours: 'Mon–Fri 8:30–17:00 (closed holidays)',
    phone: '03-1234-5678',
    fee: '¥300',
    processingTime: 'Same day (approx. 15 min)',
    linkUrl: 'https://example.com/apply',
    linkLabel: 'Check Online',
    __schema: {
      type: 'object',
      title: 'ApplicationGuide',
      properties: {
        title: { type: 'string', title: 'Section Title' },
        procedureName: { type: 'string', title: 'Procedure Name' },
        description: { type: 'string', title: 'Description', 'x-widget': 'textarea' },
        fee: { type: 'string', title: 'Fee' },
        processingTime: { type: 'string', title: 'Processing Time' },
        office: { type: 'string', title: 'Office' },
        hours: { type: 'string', title: 'Office Hours' },
        phone: { type: 'string', title: 'Contact Phone' },
        linkLabel: { type: 'string', title: 'Action Button Label' },
      },
    },
    __interactions: [],
  },
  CouncilSchedule: {
    _componentDesc: 'Council/committee schedule with agenda and status',
    title: 'Council Schedule',
    sessions: [
      { id: 'cs1', date: '2026-07-01', title: 'Regular City Council Meeting', status: 'upcoming', time: '10:00–16:00', committee: 'Full Council', agenda: ['Approval of previous minutes', 'Budget amendment proposal', 'Public comment period'] },
      { id: 'cs2', date: '2026-06-20', title: 'Finance Committee Hearing', status: 'adjourned', time: '13:00–15:30', committee: 'Finance', agenda: ['Q1 fiscal review', 'Infrastructure spending approval'] },
      { id: 'cs3', date: '2026-06-15', title: 'Zoning Board Meeting', status: 'adjourned', time: '14:00–16:00', committee: 'Zoning', agenda: ['Downtown redevelopment proposal', 'Public hearing'] },
    ],
    showAgenda: true,
    __schema: {
      type: 'object',
      title: 'CouncilSchedule',
      properties: {
        title: { type: 'string', title: 'Title' },
        showAgenda: { type: 'boolean', title: 'Show Agenda on Expand' },
        maxItems: { type: 'number', title: 'Max Items' },
      },
    },
    __interactions: [
      { id: 'council-schedule-select-state', event: 'select', action: 'set-shared-state', targetPath: 'publish.selectedContentId', valueFrom: '$.id', enabled: true },
      { id: 'council-schedule-select-event', event: 'select', action: 'emit-event', targetPath: 'publish:content:selected', valueFrom: '$', enabled: true },
    ],
  },
  EmergencyAlert: {
    _componentDesc: 'High-severity emergency/disaster alert banner',
    dismissible: true,
    alerts: [
      { id: 'ea1', title: 'Typhoon Warning: Stay Indoors', description: 'Typhoon No.8 approaching. Strong winds and heavy rain expected through midnight. Please stay indoors and avoid non-essential travel.', severity: 'critical', issuedAt: '2026-06-26 09:00', issuedBy: 'Japan Meteorological Agency', linkUrl: '#', linkLabel: 'Evacuation Info' },
      { id: 'ea2', title: 'Emergency Road Closure: Main Street Bridge', description: 'Structural inspection required. Detour via River Road until further notice.', severity: 'warning', issuedAt: '2026-06-25 14:30', issuedBy: 'Public Works Dept' },
    ],
    __schema: {
      type: 'object',
      title: 'EmergencyAlert',
      properties: {
        dismissible: { type: 'boolean', title: 'Dismissible' },
        maxAlerts: { type: 'number', title: 'Max Alerts to Show' },
      },
    },
    __interactions: [],
  },
  GovernmentServiceNav: {
    _componentDesc: 'Government service category grid navigation',
    title: 'Municipal Services',
    description: 'Find the service you need.',
    columns: 3,
    services: [
      { id: 'gs1', label: 'Tax & Finance', icon: '💰', description: 'Property tax, income tax, payment plans' },
      { id: 'gs2', label: 'Health & Welfare', icon: '🏥', description: 'Insurance, healthcare, social welfare' },
      { id: 'gs3', label: 'Child & Education', icon: '🎓', description: 'Schools, childcare, scholarships' },
      { id: 'gs4', label: 'Housing & Construction', icon: '🏠', description: 'Building permits, housing assistance' },
      { id: 'gs5', label: 'Transport & Infrastructure', icon: '🚌', description: 'Roads, parking, public transit' },
      { id: 'gs6', label: 'Environment & Waste', icon: '♻️', description: 'Recycling, waste collection, parks' },
      { id: 'gs7', label: 'Business & Labor', icon: '💼', description: 'Licenses, employment, business registration' },
      { id: 'gs8', label: 'Culture & Sports', icon: '🎭', description: 'Libraries, museums, sports facilities' },
      { id: 'gs9', label: 'Safety & Emergency', icon: '🛡️', description: 'Police, fire, disaster preparedness' },
    ],
    __schema: {
      type: 'object',
      title: 'GovernmentServiceNav',
      properties: {
        title: { type: 'string', title: 'Title' },
        description: { type: 'string', title: 'Description' },
        columns: { type: 'number', title: 'Columns', enum: [2, 3, 4] },
      },
    },
    __interactions: [
      { id: 'gov-service-nav-select-state', event: 'select', action: 'set-shared-state', targetPath: 'publish.selectedContentId', valueFrom: '$.id', enabled: true },
      { id: 'gov-service-nav-select-event', event: 'select', action: 'emit-event', targetPath: 'publish:content:selected', valueFrom: '$', enabled: true },
    ],
  },
  AnnouncementBanner: {
    _componentDesc: 'Rotating announcement banners',
    announcements: [
      { id: 'a1', text: 'City Hall will be closed on Memorial Day, May 25.', severity: 'info' },
      { id: 'a2', text: 'Emergency road repairs on Main Street through June 1.', severity: 'warning' },
    ],
    dismissible: true,
    autoRotate: true,
  },
  AuthorProfile: {
    _componentDesc: 'Author profile with photo, bio, and works list',
    name: 'Haruki Murakami',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    bio: 'Internationally acclaimed author known for his surreal and imaginative works. His novels have been translated into over 50 languages and have won numerous literary awards worldwide.',
    nationality: 'Japanese',
    born: '1949',
    works: [
      { id: 'w1', title: 'Norwegian Wood', publishedAt: '1987', format: 'Paperback' },
      { id: 'w2', title: 'Kafka on the Shore', publishedAt: '2002', format: 'Hardcover' },
      { id: 'w3', title: '1Q84', publishedAt: '2009', format: 'Hardcover' },
    ],
    __schema: {
      type: 'object', title: 'AuthorProfile',
      properties: {
        name: { type: 'string', title: 'Author Name' },
        image: { type: 'string', title: 'Photo URL', format: 'uri', 'x-media-type': 'image' },
        bio: { type: 'string', title: 'Biography', 'x-widget': 'textarea' },
        nationality: { type: 'string', title: 'Nationality' },
        born: { type: 'string', title: 'Born' },
        website: { type: 'string', title: 'Website URL', format: 'uri' },
      },
    },
    __interactions: [
      { id: 'author-profile-select-state', event: 'select', action: 'set-shared-state', targetPath: 'publish.selectedContentId', valueFrom: '$.id', enabled: true },
      { id: 'author-profile-select-event', event: 'select', action: 'emit-event', targetPath: 'publish:content:selected', valueFrom: '$', enabled: true },
    ],
  },
  ReviewCard: {
    _componentDesc: 'Star rating and review excerpt card for books/publications',
    title: 'A Masterpiece of Modern Literature',
    bookTitle: 'Kafka on the Shore',
    reviewer: 'Literary Review',
    rating: 4.5,
    excerpt: 'Murakami weaves together parallel narratives with masterful precision, creating a work that is at once deeply personal and universally resonant. This is a novel that rewards multiple readings.',
    fullReview: 'Murakami weaves together parallel narratives with masterful precision, creating a work that is at once deeply personal and universally resonant. This is a novel that rewards multiple readings, each revealing new layers of meaning and connection. The author\'s characteristic blend of mundane reality and surreal fantasy reaches new heights here, challenging readers to question the boundaries between dreams and waking life.',
    date: 'June 2026',
    source: 'Literary Review',
    bookImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80&h=120&fit=crop',
    __schema: {
      type: 'object', title: 'ReviewCard',
      properties: {
        title: { type: 'string', title: 'Review Title' },
        bookTitle: { type: 'string', title: 'Book Title' },
        reviewer: { type: 'string', title: 'Reviewer' },
        rating: { type: 'number', title: 'Rating (1-5)', minimum: 0, maximum: 5 },
        excerpt: { type: 'string', title: 'Excerpt', 'x-widget': 'textarea' },
        date: { type: 'string', title: 'Date' },
        source: { type: 'string', title: 'Source' },
      },
    },
    __interactions: [
      { id: 'review-card-select-state', event: 'select', action: 'set-shared-state', targetPath: 'publish.selectedContentId', valueFrom: '$.id', enabled: true },
      { id: 'review-card-select-event', event: 'select', action: 'emit-event', targetPath: 'publish:content:selected', valueFrom: '$', enabled: true },
    ],
  },
  SeriesCard: {
    _componentDesc: 'Book series volume listing card',
    title: 'The Wind-Up Bird Chronicle',
    author: 'Haruki Murakami',
    description: 'A three-volume epic exploring memory, identity, and the shadows of war.',
    totalVolumes: 3,
    currentVolume: 1,
    volumes: [
      { id: 'sv1', number: 1, title: 'The Thieving Magpie', coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=180&fit=crop', publishedAt: '1994', pageCount: 368 },
      { id: 'sv2', number: 2, title: 'The Bird as Prophet', coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&h=180&fit=crop', publishedAt: '1995', pageCount: 400 },
      { id: 'sv3', number: 3, title: 'The Bird-Catcher', coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=120&h=180&fit=crop', publishedAt: '1995', pageCount: 384 },
    ],
    __schema: {
      type: 'object', title: 'SeriesCard',
      properties: {
        title: { type: 'string', title: 'Series Title' },
        author: { type: 'string', title: 'Author' },
        description: { type: 'string', title: 'Description', 'x-widget': 'textarea' },
        totalVolumes: { type: 'number', title: 'Total Volumes' },
        currentVolume: { type: 'number', title: 'Current Volume' },
      },
    },
    __interactions: [
      { id: 'series-card-select-state', event: 'select', action: 'set-shared-state', targetPath: 'publish.selectedContentId', valueFrom: '$.id', enabled: true },
      { id: 'series-card-select-event', event: 'select', action: 'emit-event', targetPath: 'publish:content:selected', valueFrom: '$', enabled: true },
    ],
  },
  RankingBoard: {
    _componentDesc: 'Top-10 ranking board with rank change indicators',
    title: 'Bestsellers',
    description: 'This week\'s top-selling books',
    category: 'Fiction',
    items: [
      { id: 'r1', rank: 1, title: 'Kafka on the Shore', author: 'Haruki Murakami', coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80&h=120&fit=crop', rating: 4.5, previousRank: 2, badge: '#1 NEW' },
      { id: 'r2', rank: 2, title: 'The Great Adventure', author: 'John Smith', coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=80&h=120&fit=crop', rating: 4.3, previousRank: 1 },
      { id: 'r3', rank: 3, title: 'Digital Horizons', author: 'Emily Chen', coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=80&h=120&fit=crop', rating: 4.1, previousRank: 4 },
      { id: 'r4', rank: 4, title: 'The Art of Manga', author: 'Yuki Tanaka', coverImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=80&h=120&fit=crop', rating: 4.0, previousRank: 3 },
      { id: 'r5', rank: 5, title: 'Shadow Realm', author: 'Satoshi Yamamoto', coverImage: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=80&h=120&fit=crop', rating: 3.9, previousRank: 7 },
    ],
    __schema: {
      type: 'object', title: 'RankingBoard',
      properties: {
        title: { type: 'string', title: 'Title' },
        description: { type: 'string', title: 'Description' },
        category: { type: 'string', title: 'Category' },
        maxItems: { type: 'number', title: 'Max Items' },
      },
    },
    __interactions: [
      { id: 'ranking-board-select-state', event: 'select', action: 'set-shared-state', targetPath: 'publish.selectedContentId', valueFrom: '$.id', enabled: true },
      { id: 'ranking-board-select-event', event: 'select', action: 'emit-event', targetPath: 'publish:content:selected', valueFrom: '$', enabled: true },
    ],
  },
  EventCalendar: {
    _componentDesc: 'Monthly event calendar with date selection',
    title: 'Events Calendar',
    events: [
      { id: 'ec1', title: 'Summer Music Festival', date: '2026-07-15', time: '10:00', category: 'Music', location: 'Central Park' },
      { id: 'ec2', title: 'Art Exhibition Opening', date: '2026-07-15', time: '18:00', category: 'Art', location: 'City Gallery' },
      { id: 'ec3', title: 'Food Festival', date: '2026-07-20', time: '11:00', category: 'Food' },
      { id: 'ec4', title: 'Jazz Night', date: '2026-07-05', time: '19:30', category: 'Music', location: 'Blue Note Club' },
      { id: 'ec5', title: 'Film Screening: Classics', date: '2026-06-30', time: '20:00', category: 'Film' },
    ],
    __schema: {
      type: 'object', title: 'EventCalendar',
      properties: {
        title: { type: 'string', title: 'Title' },
      },
    },
    __interactions: [
      { id: 'calendar-select-state', event: 'select', action: 'set-shared-state', targetPath: 'publish.selectedContentId', valueFrom: '$.id', enabled: true },
      { id: 'calendar-select-event', event: 'select', action: 'emit-event', targetPath: 'publish:content:selected', valueFrom: '$', enabled: true },
    ],
  },
  TicketCard: {
    _componentDesc: 'Event ticket type/price/purchase card',
    eventTitle: 'Summer Music Festival 2026',
    eventDate: 'July 15–17, 2026',
    venue: 'Central Park, New York',
    salesEndDate: 'July 14, 2026',
    tiers: [
      { id: 't1', name: 'General Admission', price: '$150', description: 'Access to all stages and general seating areas.', available: true, remaining: 120 },
      { id: 't2', name: 'VIP Pass', price: '$350', description: 'Priority entry, VIP lounge access, and exclusive merchandise.', available: true, remaining: 45, badge: 'BEST VALUE' },
      { id: 't3', name: 'Platinum Package', price: '$750', description: 'Front-row seating, meet & greet, and backstage tour.', available: false, badge: 'SOLD OUT' },
    ],
    purchaseUrl: '#',
    __schema: {
      type: 'object', title: 'TicketCard',
      properties: {
        eventTitle: { type: 'string', title: 'Event Title' },
        eventDate: { type: 'string', title: 'Event Date' },
        venue: { type: 'string', title: 'Venue' },
        purchaseUrl: { type: 'string', title: 'Purchase URL', format: 'uri' },
        purchaseLabel: { type: 'string', title: 'Purchase Button Label' },
      },
    },
    __interactions: [],
  },
  VenueCard: {
    _componentDesc: 'Venue information card with map and access details',
    name: 'Madison Square Garden',
    address: '4 Pennsylvania Plaza, New York, NY 10001',
    capacity: '20,789',
    access: 'Penn Station (subway A/C/E/1/2/3) — 2 min walk',
    parking: 'MSG Parking Garage, 51st St & 8th Ave',
    phone: '(212) 465-6000',
    website: 'https://www.msg.com',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
    mapUrl: 'https://maps.google.com/?q=Madison+Square+Garden',
    __schema: {
      type: 'object', title: 'VenueCard',
      properties: {
        name: { type: 'string', title: 'Venue Name' },
        address: { type: 'string', title: 'Address' },
        capacity: { type: 'string', title: 'Capacity' },
        access: { type: 'string', title: 'Access Info' },
        parking: { type: 'string', title: 'Parking Info' },
        website: { type: 'string', title: 'Website URL', format: 'uri' },
        image: { type: 'string', title: 'Image URL', format: 'uri', 'x-media-type': 'image' },
        mapUrl: { type: 'string', title: 'Map URL', format: 'uri' },
      },
    },
    __interactions: [],
  },
  ScheduleList: {
    _componentDesc: 'Event/festival session timetable with timeline',
    title: 'Day 1 Schedule',
    date: 'July 15, 2026',
    showTrackFilter: true,
    tracks: ['Main Stage', 'Acoustic Tent', 'Workshop'],
    items: [
      { id: 'sl1', time: '10:00', title: 'Opening Ceremony', location: 'Main Stage', track: 'Main Stage', description: 'Welcome address and festival overview.' },
      { id: 'sl2', time: '11:30', title: 'Indie Rock Showcase', speaker: 'The Neon Lights', location: 'Main Stage', track: 'Main Stage', description: 'High-energy set from the breakout band.' },
      { id: 'sl3', time: '11:30', title: 'Acoustic Morning', speaker: 'Sarah Moon', location: 'Acoustic Tent', track: 'Acoustic Tent', description: 'Intimate acoustic performance.' },
      { id: 'sl4', time: '13:00', title: 'Jazz Fusion', speaker: 'Blue Note Collective', location: 'Main Stage', track: 'Main Stage' },
      { id: 'sl5', time: '14:30', title: 'Songwriting Workshop', speaker: 'Mike Rivers', location: 'Workshop Room', track: 'Workshop' },
    ],
    __schema: {
      type: 'object', title: 'ScheduleList',
      properties: {
        title: { type: 'string', title: 'Title' },
        date: { type: 'string', title: 'Date' },
        showTrackFilter: { type: 'boolean', title: 'Show Track Filter' },
      },
    },
    __interactions: [
      { id: 'schedule-list-select-state', event: 'select', action: 'set-shared-state', targetPath: 'publish.selectedContentId', valueFrom: '$.id', enabled: true },
      { id: 'schedule-list-select-event', event: 'select', action: 'emit-event', targetPath: 'publish:content:selected', valueFrom: '$', enabled: true },
    ],
  },
  EventFilterBar: {
    _componentDesc: 'Event filter bar with date range, category, area, and price',
    categories: [
      { id: 'music', label: 'Music' },
      { id: 'art', label: 'Art' },
      { id: 'food', label: 'Food' },
      { id: 'film', label: 'Film' },
      { id: 'sports', label: 'Sports' },
      { id: 'family', label: 'Family' },
    ],
    areas: [
      { id: 'downtown', label: 'Downtown' },
      { id: 'midtown', label: 'Midtown' },
      { id: 'uptown', label: 'Uptown' },
      { id: 'brooklyn', label: 'Brooklyn' },
    ],
    keywordKey: 'publish.searchQuery',
    __schema: {
      type: 'object', title: 'EventFilterBar',
      properties: {},
    },
    __interactions: [
      { id: 'efb-search-state', event: 'search', action: 'set-shared-state', targetPath: 'publish.searchQuery', valueFrom: '$.keyword', enabled: true },
      { id: 'efb-filter-change', event: 'filter-change', action: 'emit-event', targetPath: 'publish:search:changed', valueFrom: '$', enabled: true },
    ],
  },
  BookCard: {
    _componentDesc: 'Book card with star rating',
    title: 'The Great Adventure',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    author: 'John Smith',
    publisher: 'Chronicle Books',
    format: 'Hardcover',
    price: '$24.99',
    description: 'An epic journey through uncharted territories.',
    rating: 4,
    __schema: {
      type: 'object',
      title: 'BookCard',
      properties: {
        title: { type: 'string', title: 'Title' },
        coverImage: { type: 'string', title: 'Cover Image URL', format: 'uri', 'x-media-type': 'image' },
        author: { type: 'string', title: 'Author' },
        publisher: { type: 'string', title: 'Publisher' },
        format: { type: 'string', title: 'Format', enum: ['Hardcover', 'Paperback', 'eBook', 'Audiobook'] },
        price: { type: 'string', title: 'Price' },
        description: { type: 'string', title: 'Description', 'x-widget': 'textarea' },
        rating: { type: 'integer', title: 'Rating', minimum: 1, maximum: 5 },
      },
    },
    __interactions: [
      {
        id: 'book-card-select-state',
        event: 'select',
        action: 'set-shared-state',
        targetPath: 'publish.selectedContentId',
        valueFrom: '$.id',
        enabled: true,
      },
      {
        id: 'book-card-select-event',
        event: 'select',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$',
        enabled: true,
      },
    ],
  },
  VerticalArticle: {
    _componentDesc: 'Full article view for vertical (tategaki) reading',
    title: '近代文学の展望 — Perspectives on Modern Literature',
    content: '<p>In the ever-evolving landscape of Japanese literature, the interplay between traditional narrative forms and contemporary themes has created a rich tapestry of expression that continues to captivate readers worldwide.</p><p>Modern authors increasingly draw upon classical techniques such as <ruby>枕詞<rt>makurakotoba</rt></ruby> and <ruby>掛詞<rt>kakekotoba</rt></ruby>, weaving ancient poetic devices into stories that address pressing contemporary issues. This fusion of old and new represents not merely a stylistic choice but a profound meditation on cultural continuity in an age of rapid change.</p>',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    contentType: 'publication',
    category: 'Literature',
    author: '田中 花子 (Hanako Tanaka)',
    publishedAt: 'June 11, 2026',
    tags: ['literature', 'japanese', 'vertical-writing', 'tategaki'],
    columnCount: 2,
    lineWidth: 40,
    seriesName: 'Literary Horizons',
    chapterNumber: 3,
    totalChapters: 12,
    __schema: {
      type: 'object',
      title: 'VerticalArticle',
      properties: {
        title: { type: 'string', title: 'Title' },
        content: { type: 'string', title: 'Content', 'x-widget': 'textarea' },
        image: { type: 'string', title: 'Image URL', format: 'uri', 'x-media-type': 'image' },
        contentType: { type: 'string', title: 'Type', enum: ['news', 'government', 'publication', 'comic', 'entertainment'] },
        category: { type: 'string', title: 'Category' },
        author: { type: 'string', title: 'Author' },
        publishedAt: { type: 'string', title: 'Date' },
        columnCount: { type: 'number', title: 'Columns (段組み)', minimum: 1, maximum: 4 },
        lineWidth: { type: 'number', title: 'Line Width (行幅)', minimum: 20, maximum: 60 },
      },
    },
    __interactions: [
      {
        id: 'vertical-article-select',
        event: 'select',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$.id',
        enabled: true,
      },
    ],
  },
  WritingModeToggle: {
    _componentDesc: '横書き/縦書き toggle for reading mode',
    current: 'horizontal-tb',
    variant: 'full',
    label: 'Reading Mode',
    __schema: {
      type: 'object',
      title: 'WritingModeToggle',
      properties: {
        current: { type: 'string', title: 'Current Mode', enum: ['horizontal-tb', 'vertical-rl', 'vertical-lr'] },
        variant: { type: 'string', title: 'Variant', enum: ['full', 'compact'] },
        label: { type: 'string', title: 'Label' },
        position: { type: 'string', title: 'Position', enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] },
      },
    },
    __interactions: [
      {
        id: 'writing-mode-change',
        event: 'change',
        action: 'set-shared-state',
        targetPath: 'publish.viewMode',
        valueFrom: '$.current',
        enabled: true,
      },
    ],
  },
  RelatedArticles: {
    _componentDesc: 'Related/suggested articles grid',
    title: 'Related Articles',
    articles: [
      { id: 'r1', title: 'The Evolution of Japanese Typography', excerpt: 'From movable type to digital fonts.', category: 'Design', contentType: 'publication', publishedAt: 'May 28', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=225&fit=crop' },
      { id: 'r2', title: 'Vertical Writing in the Digital Age', excerpt: 'How tategaki adapts to screens.', category: 'Technology', contentType: 'news', publishedAt: 'May 25', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=225&fit=crop' },
      { id: 'r3', title: 'Modern Manga: Breaking Boundaries', excerpt: 'New series redefine the medium.', category: 'Manga', contentType: 'comic', publishedAt: 'May 22', image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=225&fit=crop' },
    ],
    maxArticles: 6,
    columns: 3,
    selectedContentIdKey: 'publish.selectedContentId',
    __schema: {
      type: 'object',
      title: 'RelatedArticles',
      properties: {
        title: { type: 'string', title: 'Section Title' },
        maxArticles: { type: 'number', title: 'Max Articles', minimum: 1, maximum: 12 },
        columns: { type: 'number', title: 'Columns', enum: [2, 3, 4] },
      },
    },
    __interactions: [
      {
        id: 'related-article-select-state',
        event: 'select',
        action: 'set-shared-state',
        targetPath: 'publish.selectedContentId',
        valueFrom: '$.id',
        enabled: true,
      },
      {
        id: 'related-article-select-event',
        event: 'select',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$',
        enabled: true,
      },
    ],
  },
  NewsArticleCard: {
    _componentDesc: 'News article card with source badge',
    title: 'Markets Hit All-Time High as Economy Surges',
    excerpt: 'Global markets reached unprecedented levels driven by strong consumer spending and corporate earnings, with major indices posting record gains across all sectors.',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    source: 'Financial Times',
    category: 'Business',
    author: 'Jane Doe',
    publishedAt: 'May 22, 2026',
    contentType: 'news',
    featured: false,
    __schema: {
      type: 'object',
      title: 'NewsArticleCard',
      properties: {
        title: { type: 'string', title: 'Title' },
        excerpt: { type: 'string', title: 'Excerpt', 'x-widget': 'textarea' },
        image: { type: 'string', title: 'Image URL', format: 'uri', 'x-media-type': 'image' },
        source: { type: 'string', title: 'Source' },
        category: { type: 'string', title: 'Category' },
        author: { type: 'string', title: 'Author' },
        avatar: { type: 'string', title: 'Avatar URL', format: 'uri', 'x-media-type': 'image' },
        publishedAt: { type: 'string', title: 'Date' },
        contentType: { type: 'string', title: 'Type', enum: ['news', 'government', 'publication', 'comic', 'entertainment'] },
        featured: { type: 'boolean', title: 'Featured' },
      },
    },
    __interactions: [
      {
        id: 'news-card-select-state',
        event: 'select',
        action: 'set-shared-state',
        targetPath: 'publish.selectedContentId',
        valueFrom: '$.id',
        enabled: true,
      },
      {
        id: 'news-card-select-event',
        event: 'select',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$',
        enabled: true,
      },
    ],
  },
  NewspaperHeader: {
    _componentDesc: 'Newspaper masthead with nameplate, date, edition, weather, and section nav',
    __componentSpec: 'component.newspaperHeader.desc',
    name: 'The Daily Chronicle',
    tagline: 'All the News That\'s Fit to Print',
    edition: 'Vol. CLXII No. 47',
    variant: 'standard',
    sections: [
      { label: 'Politics', slug: 'politics' },
      { label: 'Economy', slug: 'economy' },
      { label: 'International', slug: 'international' },
      { label: 'Society', slug: 'society' },
      { label: 'Culture', slug: 'culture' },
      { label: 'Sports', slug: 'sports' },
      { label: 'Opinion', slug: 'opinion' },
    ],
    weather: { city: 'Tokyo', temp: '22°C', icon: '☀️', condition: 'Sunny' },
    __schema: {
      type: 'object',
      title: 'NewspaperHeader',
      properties: {
        name: { type: 'string', title: 'Newspaper Name' },
        tagline: { type: 'string', title: 'Tagline/Motto' },
        date: { type: 'string', title: 'Date (auto if empty)' },
        edition: { type: 'string', title: 'Edition/Volume' },
        variant: { type: 'string', title: 'Variant', enum: ['standard', 'compact'] },
        logoImage: { type: 'string', title: 'Logo Image URL', format: 'uri', 'x-media-type': 'image' },
        'weather.city': { type: 'string', title: 'Weather City' },
        'weather.temp': { type: 'string', title: 'Weather Temperature' },
        'weather.condition': { type: 'string', title: 'Weather Condition' },
      },
    },
    __interactions: [
      {
        id: 'newspaper-section-change-state',
        event: 'section-change',
        action: 'set-shared-state',
        targetPath: 'publish.activeSection',
        valueFrom: '$.section',
        enabled: true,
      },
      {
        id: 'newspaper-section-change-event',
        event: 'section-change',
        action: 'emit-event',
        targetPath: 'publish:section:changed',
        valueFrom: '$',
        enabled: true,
      },
    ],
  },
  LeadStory: {
    _componentDesc: 'Lead/top article on a newspaper front page with headline, deck, byline, and multi-column body',
    __componentSpec: 'component.leadStory.desc',
    title: 'Global Summit Concludes with Historic Climate Agreement',
    deck: 'World leaders reach landmark accord on emissions reductions, pledging $500 billion in green technology investments over the next decade.',
    content: '<p>In a landmark moment for international cooperation, leaders from 195 nations have signed the most comprehensive climate agreement in history. The accord, reached after two weeks of intensive negotiations in Paris, commits signatories to a 60% reduction in carbon emissions by 2040.</p><p>"This is a turning point for our planet," said the UN Secretary General at the closing ceremony. "For the first time, we have a binding framework that every nation — from the largest industrial powers to the smallest island states — has agreed to uphold."</p><p>Key provisions include a $500 billion green technology fund, mandatory annual emissions reporting, and a carbon border adjustment mechanism that will reshape global trade patterns.</p>',
    image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&h=600&fit=crop',
    category: 'International',
    badgeText: 'BREAKING',
    badgeColor: 'red',
    author: 'Sarah Mitchell',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    publishedAt: 'June 26, 2026',
    columnCount: 2,
    pullQuote: {
      text: 'This is a turning point for our planet. For the first time, we have a binding framework that every nation has agreed to uphold.',
      attribution: 'UN Secretary General',
    },
    tags: ['climate', 'summit', 'international', 'environment'],
    __schema: {
      type: 'object',
      title: 'LeadStory',
      properties: {
        title: { type: 'string', title: 'Headline' },
        deck: { type: 'string', title: 'Deck/Subheadline', 'x-widget': 'textarea' },
        content: { type: 'string', title: 'Body Content', 'x-widget': 'textarea' },
        image: { type: 'string', title: 'Hero Image URL', format: 'uri', 'x-media-type': 'image' },
        imageCaption: { type: 'string', title: 'Image Caption' },
        category: { type: 'string', title: 'Section/Category' },
        badgeText: { type: 'string', title: 'Badge (e.g. BREAKING)' },
        badgeColor: { type: 'string', title: 'Badge Color', enum: ['red', 'blue', 'amber', 'green'] },
        author: { type: 'string', title: 'Author' },
        publishedAt: { type: 'string', title: 'Date' },
        columnCount: { type: 'number', title: 'Columns', enum: [1, 2, 3] },
      },
    },
    __interactions: [
      {
        id: 'lead-story-select-state',
        event: 'select',
        action: 'set-shared-state',
        targetPath: 'publish.selectedContentId',
        valueFrom: '$.id',
        enabled: true,
      },
      {
        id: 'lead-story-select-event',
        event: 'select',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$',
        enabled: true,
      },
    ],
  },
  PrimaryArticleCard: {
    _componentDesc: 'Medium-prominence news article card with left border accent and serif headline',
    __componentSpec: 'component.primaryArticleCard.desc',
    title: 'New Environmental Regulations Take Effect This Month',
    excerpt: 'Stricter emissions standards for industries begin implementation across all sectors, with a focus on manufacturing and transportation.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop',
    section: 'Politics',
    author: 'Emily Chen',
    publishedAt: 'June 25, 2026',
    __schema: {
      type: 'object',
      title: 'PrimaryArticleCard',
      properties: {
        title: { type: 'string', title: 'Headline' },
        excerpt: { type: 'string', title: 'Excerpt', 'x-widget': 'textarea' },
        image: { type: 'string', title: 'Image URL', format: 'uri', 'x-media-type': 'image' },
        section: { type: 'string', title: 'Section Label' },
        sectionColor: { type: 'string', title: 'Border Color Class (optional)' },
        author: { type: 'string', title: 'Author' },
        publishedAt: { type: 'string', title: 'Date' },
        url: { type: 'string', title: 'Article URL', format: 'uri' },
      },
    },
    __interactions: [
      {
        id: 'primary-article-select-state',
        event: 'select',
        action: 'set-shared-state',
        targetPath: 'publish.selectedContentId',
        valueFrom: '$.id',
        enabled: true,
      },
      {
        id: 'primary-article-select-event',
        event: 'select',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$',
        enabled: true,
      },
    ],
  },
  SecondaryArticleCard: {
    _componentDesc: 'Compact text-only news article card with headline and excerpt',
    __componentSpec: 'component.secondaryArticleCard.desc',
    title: 'Local Markets Show Resilience Amid Global Uncertainty',
    excerpt: 'Regional stock exchanges outperformed global indices as domestic demand remained strong.',
    section: 'Economy',
    author: 'Market Desk',
    publishedAt: 'June 26, 2026',
    __schema: {
      type: 'object',
      title: 'SecondaryArticleCard',
      properties: {
        title: { type: 'string', title: 'Headline' },
        excerpt: { type: 'string', title: 'Excerpt', 'x-widget': 'textarea' },
        section: { type: 'string', title: 'Section Label' },
        author: { type: 'string', title: 'Author' },
        publishedAt: { type: 'string', title: 'Date' },
        url: { type: 'string', title: 'Article URL', format: 'uri' },
      },
    },
    __interactions: [
      {
        id: 'secondary-article-select-state',
        event: 'select',
        action: 'set-shared-state',
        targetPath: 'publish.selectedContentId',
        valueFrom: '$.id',
        enabled: true,
      },
      {
        id: 'secondary-article-select-event',
        event: 'select',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$',
        enabled: true,
      },
    ],
  },
  BriefItem: {
    _componentDesc: 'Single-line news brief for rapid-scan lists and tickers',
    __componentSpec: 'component.briefItem.desc',
    title: 'Nikkei index closes 2.3% higher on tech rally',
    time: '11:30 AM',
    category: 'Economy',
    isUrgent: false,
    __schema: {
      type: 'object',
      title: 'BriefItem',
      properties: {
        title: { type: 'string', title: 'Headline' },
        time: { type: 'string', title: 'Time Label' },
        category: { type: 'string', title: 'Category' },
        isUrgent: { type: 'boolean', title: 'Urgent' },
        url: { type: 'string', title: 'URL', format: 'uri' },
      },
    },
    __interactions: [
      {
        id: 'brief-item-select-state',
        event: 'select',
        action: 'set-shared-state',
        targetPath: 'publish.selectedContentId',
        valueFrom: '$.id',
        enabled: true,
      },
      {
        id: 'brief-item-select-event',
        event: 'select',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$',
        enabled: true,
      },
    ],
  },
  EditorialCard: {
    _componentDesc: 'Opinion/editorial column card with author photo, quote, and bio',
    __componentSpec: 'component.editorialCard.desc',
    author: 'Maria Gonzalez',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    authorTitle: 'Senior Editor, Opinion Desk',
    title: 'Democracy Thrives When Citizens Stay Informed',
    excerpt: 'The health of our democracy depends not just on the right to vote, but on the willingness of citizens to engage with ideas that challenge their own.',
    publishedAt: 'June 26, 2026',
    label: 'OPINION',
    __schema: {
      type: 'object',
      title: 'EditorialCard',
      properties: {
        author: { type: 'string', title: 'Author Name' },
        authorImage: { type: 'string', title: 'Author Photo URL', format: 'uri', 'x-media-type': 'image' },
        authorTitle: { type: 'string', title: 'Author Title/Role' },
        title: { type: 'string', title: 'Headline' },
        excerpt: { type: 'string', title: 'Excerpt/Quote', 'x-widget': 'textarea' },
        label: { type: 'string', title: 'Label (e.g. OPINION)' },
        publishedAt: { type: 'string', title: 'Date' },
        url: { type: 'string', title: 'Article URL', format: 'uri' },
      },
    },
    __interactions: [
      {
        id: 'editorial-select-state',
        event: 'select',
        action: 'set-shared-state',
        targetPath: 'publish.selectedContentId',
        valueFrom: '$.id',
        enabled: true,
      },
      {
        id: 'editorial-select-event',
        event: 'select',
        action: 'emit-event',
        targetPath: 'publish:content:selected',
        valueFrom: '$',
        enabled: true,
      },
    ],
  },
  SectionHeader: {
    _componentDesc: 'Newspaper section divider with decorative line and section title',
    __componentSpec: 'component.sectionHeader.desc',
    title: 'Politics',
    subtitle: 'National and international political coverage',
    icon: '🏛️',
    showDivider: true,
    __schema: {
      type: 'object',
      title: 'SectionHeader',
      properties: {
        title: { type: 'string', title: 'Section Title' },
        subtitle: { type: 'string', title: 'Subtitle', 'x-widget': 'textarea' },
        icon: { type: 'string', title: 'Icon/Emoji' },
        url: { type: 'string', title: 'View All URL', format: 'uri' },
        accentColor: { type: 'string', title: 'Accent Color Class' },
        showDivider: { type: 'boolean', title: 'Show Divider' },
      },
    },
    __interactions: [],
  },
  PullQuote: {
    _componentDesc: 'Standalone pull quote with large quotation mark accent and attribution',
    __componentSpec: 'component.pullQuote.desc',
    text: 'The health of our democracy depends not just on the right to vote, but on the willingness of citizens to engage with ideas that challenge their own.',
    attribution: 'Maria Gonzalez',
    attributionTitle: 'Senior Editor',
    variant: 'large',
    __schema: {
      type: 'object',
      title: 'PullQuote',
      properties: {
        text: { type: 'string', title: 'Quote Text', 'x-widget': 'textarea' },
        attribution: { type: 'string', title: 'Attribution' },
        attributionTitle: { type: 'string', title: 'Attribution Title' },
        variant: { type: 'string', title: 'Variant', enum: ['large', 'inset', 'sidebar'] },
        accentColor: { type: 'string', title: 'Accent Color Class' },
      },
    },
    __interactions: [],
  },
};

export { PublishProvider };

// ── API client layer ──
export * from './api';

// ── Sample page templates ──
export { PUBLISH_SEED_PAGES } from './sample-pages';
export type { SeedPageData } from './sample-pages';

// ── Themes and variant components ──
export { default as NewsArticleCard } from './NewsArticleCard';
export type { NewsArticleCardProps } from './NewsArticleCard';
export { default as BookCard } from './BookCard';
export { default as NewspaperHeader } from './NewspaperHeader';
export type { NewspaperHeaderProps } from './NewspaperHeader';
export { default as LeadStory } from './LeadStory';
export type { LeadStoryProps } from './LeadStory';
export { default as PrimaryArticleCard } from './PrimaryArticleCard';
export type { PrimaryArticleCardProps } from './PrimaryArticleCard';
export { default as SecondaryArticleCard } from './SecondaryArticleCard';
export type { SecondaryArticleCardProps } from './SecondaryArticleCard';
export { default as BriefItem } from './BriefItem';
export type { BriefItemProps } from './BriefItem';
export { default as EditorialCard } from './EditorialCard';
export type { EditorialCardProps } from './EditorialCard';
export { default as SectionHeader } from './SectionHeader';
export type { SectionHeaderProps } from './SectionHeader';
export { default as PullQuote } from './PullQuote';
export type { PullQuoteProps } from './PullQuote';
export type { BookCardProps } from './BookCard';
export { default as SeriesHeader } from './SeriesHeader';
export type { SeriesHeaderProps } from './SeriesHeader';
export { default as SeriesList } from './SeriesList';
export type { SeriesListProps } from './SeriesList';
export { default as DocumentList } from './DocumentList';
export type { DocumentListProps } from './DocumentList';
export { default as ApplicationGuide } from './ApplicationGuide';
export type { ApplicationGuideProps } from './ApplicationGuide';
export { default as CouncilSchedule } from './CouncilSchedule';
export type { CouncilScheduleProps } from './CouncilSchedule';
export { default as EmergencyAlert } from './EmergencyAlert';
export type { EmergencyAlertProps } from './EmergencyAlert';
export { default as GovernmentServiceNav } from './GovernmentServiceNav';
export type { GovernmentServiceNavProps } from './GovernmentServiceNav';
export { default as AuthorProfile } from './AuthorProfile';
export type { AuthorProfileProps } from './AuthorProfile';
export { default as ReviewCard } from './ReviewCard';
export type { ReviewCardProps } from './ReviewCard';
export { default as SeriesCard } from './SeriesCard';
export type { SeriesCardProps } from './SeriesCard';
export { default as RankingBoard } from './RankingBoard';
export type { RankingBoardProps } from './RankingBoard';
export { default as EventCalendar } from './EventCalendar';
export type { EventCalendarProps } from './EventCalendar';
export { default as TicketCard } from './TicketCard';
export type { TicketCardProps } from './TicketCard';
export { default as VenueCard } from './VenueCard';
export type { VenueCardProps } from './VenueCard';
export { default as ScheduleList } from './ScheduleList';
export type { ScheduleListProps } from './ScheduleList';
export { default as EventFilterBar } from './EventFilterBar';
export type { EventFilterBarProps } from './EventFilterBar';
export { default as VerticalTextContainer } from './VerticalTextContainer';
export type { VerticalTextContainerProps } from './VerticalTextContainer';
export { default as VerticalArticle } from './VerticalArticle';
export type { VerticalArticleProps } from './VerticalArticle';
export { default as WritingModeToggle } from './WritingModeToggle';
export type { WritingModeToggleProps } from './WritingModeToggle';
export { default as RelatedArticles } from './RelatedArticles';
export type { RelatedArticlesProps } from './RelatedArticles';
export { getVerticalTheme, verticalDotClass, VerticalSectionHeader, getDefaultWritingMode } from './themes';
export type { VerticalTheme } from './themes';

// Re-export types for external consumers
export type {
  PublishContent, ContentType, WritingMode, Section, Author,
  Publication, ComicChapter, Event, Document, PublishSettings,
  StackPageRuntimeApi,
} from './types';
export {
  PUBLISH_STATE_KEYS, PUBLISH_EVENTS,
  buildContentSelectionEvent, getPageState, setPageState,
} from './types';
