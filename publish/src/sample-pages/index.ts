import type { GridStackWidget } from 'gridstack';
import {
  createPublishingPageSource,
  createPublishingPageState,
  wirePublishingLayout,
} from './contracts';

export {
  createPublishingPageSource,
  createPublishingPageState,
  PUBLISHING_DATASOURCE_IDS,
  PUBLISHING_PAGE_RECIPES,
  wirePublishingLayout,
} from './contracts';
export type { PublishingPageRecipe } from './contracts';

/** Matches the StackPage PageProps interface for seed page templates */
export interface SeedPageData {
  id?: string;
  type: 'page' | 'template';
  title: string;
  excerpt?: string;
  image?: string;
  published_at?: string | null;
  status?: 'draft' | 'published';
  attributes?: Record<string, any>;
  pageState?: {
    selectedId?: string | number | null;
    keyword?: string;
    activeTab?: string;
    dialogOpen?: boolean;
    [key: string]: any;
  };
  layout: GridStackWidget[];
  source?: {
    dataSources: any[];
    lists: any[];
  };
}

// ── News Home Page ────────────────────────────────────────────────

export const NEWS_HOME: SeedPageData = {
  id: 'seed-publish-news',
  type: 'page',
  title: 'News Home',
  excerpt: 'A news portal layout featuring a hero banner, breaking news ticker, section navigation, and content grid.',
  image: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&h=400&fit=crop',
  status: 'draft',
  attributes: { margin: '0px' },
  pageState: { selectedId: null, keyword: '', activeTab: 'components' },
  layout: [
    {
      x: 0, y: 0, w: 12, h: 18,
      content: JSON.stringify({
        name: 'HeroBanner',
        props: {
          title: 'The Daily Chronicle',
          subtitle: 'Your trusted source for news and analysis.',
          backgroundImage: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1920&q=80',
          showSearch: true, searchPlaceholder: 'Search articles...',
          keywordKey: 'publish.searchQuery',
          badgeText: 'BREAKING',
        },
      }),
    },
    {
      x: 0, y: 18, w: 12, h: 6,
      content: JSON.stringify({
        name: 'BreakingNews',
        props: {
          label: 'LIVE', interval: 5000,
          items: [
            { id: 'b1', title: 'Global summit concludes with historic climate agreement' },
            { id: 'b2', title: 'City announces major public transportation initiative' },
            { id: 'b3', title: 'Tech giant reports record quarterly earnings' },
          ],
        },
      }),
    },
    {
      x: 0, y: 24, w: 12, h: 5,
      content: JSON.stringify({
        name: 'SectionNav',
        props: {
          keywordKey: 'publish.activeSection', showCounts: true,
          sections: [
            { id: 's1', name: 'News', slug: 'news', icon: '📰', contentType: 'news', count: 120 },
            { id: 's2', name: 'Government', slug: 'government', icon: '🏛️', contentType: 'government', count: 45 },
            { id: 's3', name: 'Books', slug: 'publication', icon: '📚', contentType: 'publication', count: 78 },
            { id: 's4', name: 'Manga', slug: 'comic', icon: '🎨', contentType: 'comic', count: 56 },
            { id: 's5', name: 'Events', slug: 'entertainment', icon: '🎪', contentType: 'entertainment', count: 34 },
          ],
        },
      }),
    },
    {
      x: 0, y: 29, w: 8, h: 24,
      content: JSON.stringify({
        name: 'ContentGrid',
        props: {
          title: 'Top Stories', columns: 2, selectedContentIdKey: 'publish.selectedContentId',
          contents: [
            { id: 'n1', title: 'Markets Hit All-Time High', excerpt: 'Global markets surged...', contentType: 'news', author: 'Jane Doe', publishedAt: 'May 23, 2026', featured: true, image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop' },
            { id: 'n2', title: 'City Council Approves Budget', excerpt: 'New budget focuses on infrastructure...', contentType: 'government', author: 'City Press', publishedAt: 'May 22, 2026', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop' },
            { id: 'n3', title: 'New Manga Series Tops Charts', excerpt: 'Debut chapter hits 1M reads...', contentType: 'comic', author: 'Manga Weekly', publishedAt: 'May 21, 2026', image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=400&fit=crop' },
            { id: 'n4', title: 'Summer Festival Announced', excerpt: 'Three-day event with live music...', contentType: 'entertainment', author: 'Event Guide', publishedAt: 'May 20, 2026', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop' },
          ],
        },
      }),
    },
    {
      x: 8, y: 29, w: 4, h: 24,
      content: JSON.stringify({
        name: 'ContentFeed',
        props: {
          title: 'Latest Updates', maxItems: 8, selectedContentIdKey: 'publish.selectedContentId',
          items: [
            { id: 'f1', title: 'Market opens higher on economic data', publishedAt: '9:00 AM', summary: 'Major indices up 1.2%.', contentType: 'news' },
            { id: 'f2', title: 'New environmental regulations', publishedAt: '8:30 AM', summary: 'Government unveils climate plan.', contentType: 'government' },
            { id: 'f3', title: 'Bestseller list: Fiction dominates', publishedAt: '8:00 AM', summary: 'Five new titles enter top ten.', contentType: 'publication' },
            { id: 'f4', title: 'Manga adaptation announced', publishedAt: '7:30 AM', summary: 'Popular series gets anime.', contentType: 'comic' },
            { id: 'f5', title: 'Weekend festival lineup', publishedAt: '7:00 AM', summary: 'Full artist schedule released.', contentType: 'entertainment' },
            { id: 'f6', title: 'Tech IPO breaks records', publishedAt: '6:30 AM', summary: 'Largest tech listing this year.', contentType: 'news' },
          ],
        },
      }),
    },
    {
      x: 0, y: 53, w: 12, h: 8,
      content: JSON.stringify({
        name: 'SubscriptionForm',
        props: {
          title: 'Subscribe to Our Newsletter',
          description: 'Get the latest updates delivered to your inbox.',
          placeholder: 'Enter your email', buttonLabel: 'Subscribe',
          interestCategories: [
            { id: 'news', label: 'News' }, { id: 'government', label: 'Government' },
            { id: 'publication', label: 'Books' }, { id: 'comic', label: 'Manga' },
            { id: 'entertainment', label: 'Events' },
          ],
        },
      }),
    },
  ],
};

// ── Manga Browser Page ────────────────────────────────────────────

export const MANGA_BROWSER: SeedPageData = {
  id: 'seed-publish-manga',
  type: 'page',
  title: 'Manga Browser',
  excerpt: 'A manga/comic reading page with series header, chapter list, webtoon reader, and catalog grid.',
  image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=400&fit=crop',
  status: 'draft',
  attributes: { margin: '0px' },
  pageState: { selectedId: null, keyword: '', activeTab: 'chapters' },
  layout: [
    {
      x: 0, y: 0, w: 12, h: 20,
      content: JSON.stringify({
        name: 'SeriesHeader',
        props: {
          title: 'Dragon Saga',
          coverImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=600&fit=crop',
          author: 'Yuki Tanaka',
          genres: ['Fantasy', 'Action', 'Adventure'],
          rating: 4.5,
          synopsis: 'In a world where ancient dragons have returned, a young hero must embark on a perilous journey to uncover the truth behind a forgotten prophecy. Along the way, they forge alliances, face formidable foes, and discover the strength within.',
          status: 'ongoing',
          chapterCount: 47,
          latestChapter: 'Ch. 47: The Final Trial',
          isBookmarked: true,
        },
      }),
    },
    {
      x: 8, y: 0, w: 4, h: 20,
      content: JSON.stringify({
        name: 'ChapterList',
        props: {
          seriesName: 'Dragon Saga', currentChapter: 47,
          selectedContentIdKey: 'publish.selectedContentId',
          chapters: [
            { id: 'ch-45', chapterNumber: 45, title: 'The Dragon\'s Lair', pageCount: 28, publishedAt: 'Jun 12, 2026' },
            { id: 'ch-46', chapterNumber: 46, title: 'Revelations', pageCount: 32, publishedAt: 'Jun 19, 2026' },
            { id: 'ch-47', chapterNumber: 47, title: 'The Final Trial', pageCount: 30, publishedAt: 'Jun 26, 2026' },
          ],
        },
      }),
    },
    {
      x: 0, y: 20, w: 8, h: 24,
      content: JSON.stringify({
        name: 'ComicReader',
        props: {
          title: 'Dragon Saga Ch. 47',
          pages: [
            'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&h=800&fit=crop',
            'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&h=800&fit=crop',
            'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&h=800&fit=crop',
          ],
          readingDirection: 'rtl',
          mode: 'paged',
          showThumbnails: true,
          bookmarks: [0],
        },
      }),
    },
    {
      x: 8, y: 20, w: 4, h: 24,
      content: JSON.stringify({
        name: 'ContentFeed',
        props: {
          title: 'Recent Updates', maxItems: 6,
          items: [
            { id: 'u1', title: 'Dragon Saga Ch.47 released', publishedAt: '2h ago', summary: 'The Final Trial', contentType: 'comic' },
            { id: 'u2', title: 'Neon Streets Ch.58', publishedAt: '6h ago', summary: 'New chapter out now', contentType: 'comic' },
            { id: 'u3', title: 'Shadow Realm Ch.32', publishedAt: '1d ago', summary: 'Latest update', contentType: 'comic' },
            { id: 'u4', title: 'Star Academy complete', publishedAt: '3d ago', summary: 'Series finished at 86 chapters', contentType: 'comic' },
            { id: 'u5', title: 'Spirit Tales on hiatus', publishedAt: '5d ago', summary: 'Author taking break', contentType: 'comic' },
            { id: 'u6', title: 'Chrono Academy Ch.39', publishedAt: '1w ago', summary: 'Time travel arc continues', contentType: 'comic' },
          ],
        },
      }),
    },
    {
      x: 0, y: 44, w: 12, h: 24,
      content: JSON.stringify({
        name: 'SeriesList',
        props: {
          title: 'Series Catalog',
          columns: 4,
          showSearch: true,
          showFilter: true,
          searchPlaceholder: 'Search series...',
          series: [
            { id: 's1', title: 'Dragon Saga', coverImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=600&fit=crop', author: 'Yuki Tanaka', genres: ['Fantasy', 'Action'], rating: 4.5, status: 'ongoing', chapterCount: 47, isBookmarked: true, updatedAt: '2026-06-26' },
            { id: 's2', title: 'Shadow Realm', coverImage: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=600&fit=crop', author: 'Satoshi Yamamoto', genres: ['Dark Fantasy', 'Supernatural'], rating: 4.3, status: 'ongoing', chapterCount: 32, updatedAt: '2026-06-24' },
            { id: 's3', title: 'Star Academy', coverImage: 'https://images.unsplash.com/photo-1535665279445-5f5bb0e1e6b9?w=400&h=600&fit=crop', author: 'Minji Park', genres: ['School', 'Sci-Fi'], rating: 4.1, status: 'completed', chapterCount: 86, updatedAt: '2026-05-30' },
            { id: 's4', title: 'Neon Streets', coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop', author: 'Wei Chen', genres: ['Cyberpunk', 'Action'], rating: 4.7, status: 'ongoing', chapterCount: 58, updatedAt: '2026-06-25' },
            { id: 's5', title: 'Spirit Tales', coverImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=600&fit=crop', author: 'Hana Kim', genres: ['Folklore', 'Adventure'], rating: 4.0, status: 'hiatus', chapterCount: 24, updatedAt: '2026-04-15' },
            { id: 's6', title: 'Chrono Academy', coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop', author: 'Taro Suzuki', genres: ['Time Travel', 'School', 'Romance'], rating: 4.4, status: 'ongoing', chapterCount: 39, updatedAt: '2026-06-22' },
          ],
        },
      }),
    },
    {
      x: 0, y: 68, w: 12, h: 8,
      content: JSON.stringify({
        name: 'SubscriptionForm',
        props: {
          title: 'Stay Updated',
          description: 'Get notified when new chapters are released for your favorite series.',
          placeholder: 'your@email.com', buttonLabel: 'Subscribe',
          interestCategories: [
            { id: 'shonen', label: 'Shonen' },
            { id: 'shojo', label: 'Shojo' },
            { id: 'seinen', label: 'Seinen' },
            { id: 'webtoon', label: 'Webtoon' },
          ],
        },
      }),
    },
  ],
};

// ── Government Portal Page ────────────────────────────────────────

export const GOV_PORTAL: SeedPageData = {
  id: 'seed-publish-gov',
  type: 'page',
  title: 'Government Portal',
  excerpt: 'A comprehensive municipal government portal featuring emergency alerts, service navigation, document listings, council schedule, and city news.',
  image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop',
  status: 'draft',
  attributes: { margin: '0px' },
  pageState: { selectedId: null, keyword: '', activeTab: 'announcements' },
  layout: [
    {
      x: 0, y: 0, w: 12, h: 8,
      content: JSON.stringify({
        name: 'EmergencyAlert',
        props: {
          dismissible: true,
          alerts: [
            { id: 'ea1', title: 'Typhoon Warning: Stay Indoors', description: 'Typhoon No.8 approaching. Strong winds and heavy rain expected through midnight. Please stay indoors and avoid non-essential travel.', severity: 'critical', issuedAt: '2026-06-26 09:00', issuedBy: 'Japan Meteorological Agency', linkUrl: '#', linkLabel: 'Evacuation Info' },
            { id: 'ea2', title: 'Emergency Road Closure: Main Street Bridge', description: 'Structural inspection required. Detour via River Road until further notice.', severity: 'warning', issuedAt: '2026-06-25 14:30', issuedBy: 'Public Works Dept' },
          ],
        },
      }),
    },
    {
      x: 0, y: 8, w: 12, h: 4,
      content: JSON.stringify({
        name: 'AnnouncementBanner',
        props: {
          dismissible: true, autoRotate: true,
          announcements: [
            { id: 'a1', text: 'City Hall will be closed on Memorial Day, May 25.', severity: 'info' },
            { id: 'a2', text: 'New recycling schedule starts June 1st.', severity: 'info' },
            { id: 'a3', text: 'Public hearing on zoning amendments — June 30.', severity: 'info' },
          ],
        },
      }),
    },
    {
      x: 0, y: 12, w: 12, h: 14,
      content: JSON.stringify({
        name: 'HeroBanner',
        props: {
          title: 'City of Riverside',
          subtitle: 'Official municipal portal for services, documents, and community updates.',
          backgroundImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80',
          badgeText: 'OFFICIAL', badgeColor: 'bg-emerald-600',
          showSearch: true, searchPlaceholder: 'Search services, documents...',
          keywordKey: 'publish.searchQuery',
        },
      }),
    },
    {
      x: 0, y: 26, w: 12, h: 10,
      content: JSON.stringify({
        name: 'GovernmentServiceNav',
        props: {
          title: 'Municipal Services',
          description: 'Find the service you need, quickly and easily.',
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
        },
      }),
    },
    {
      x: 0, y: 36, w: 7, h: 14,
      content: JSON.stringify({
        name: 'DocumentList',
        props: {
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
            { id: 'd4', title: 'Water Quality Report — Q2 2026', issuingAuthority: 'Environmental Agency', documentDate: 'Apr 28, 2026', documentType: 'XLSX', fileSize: '890 KB', category: 'Report' },
          ],
        },
      }),
    },
    {
      x: 7, y: 36, w: 5, h: 14,
      content: JSON.stringify({
        name: 'ApplicationGuide',
        props: {
          title: 'Application Guide',
          procedureName: 'Residence Certificate Application',
          description: 'How to apply for a residence certificate (住民票) at your local municipal office.',
          steps: [
            { step: 1, label: 'Prepare Required Documents', description: 'Bring your identification and any supporting documents.' },
            { step: 2, label: 'Visit Your Local Office', description: 'Go to the Citizen Affairs Section during business hours.' },
            { step: 3, label: 'Fill Out Application Form', description: 'Complete the application form at the counter.' },
            { step: 4, label: 'Receive Your Certificate', description: 'Payment is collected upon issuance.' },
          ],
          requiredDocuments: ['Government-issued photo ID (passport, driver\'s license)', 'Residence card or health insurance card', 'Application form (available at counter)'],
          office: 'City Hall, 2F Citizen Affairs Section',
          hours: 'Mon–Fri 8:30–17:00 (closed holidays)',
          phone: '03-1234-5678',
          fee: '¥300',
          processingTime: 'Same day (approx. 15 min)',
          linkUrl: '#',
          linkLabel: 'Check Online',
        },
      }),
    },
    {
      x: 0, y: 50, w: 12, h: 8,
      content: JSON.stringify({
        name: 'CouncilSchedule',
        props: {
          title: 'Council Schedule',
          showAgenda: true,
          sessions: [
            { id: 'cs1', date: '2026-07-01', title: 'Regular City Council Meeting', status: 'upcoming', time: '10:00–16:00', committee: 'Full Council', agenda: ['Approval of previous minutes', 'Budget amendment proposal', 'Public comment period'] },
            { id: 'cs2', date: '2026-06-20', title: 'Finance Committee Hearing', status: 'adjourned', time: '13:00–15:30', committee: 'Finance', agenda: ['Q1 fiscal review', 'Infrastructure spending approval'] },
            { id: 'cs3', date: '2026-06-15', title: 'Zoning Board Meeting', status: 'adjourned', time: '14:00–16:00', committee: 'Zoning', agenda: ['Downtown redevelopment proposal', 'Public hearing'] },
          ],
        },
      }),
    },
    {
      x: 0, y: 58, w: 12, h: 14,
      content: JSON.stringify({
        name: 'ContentGrid',
        props: {
          title: 'City News & Updates', columns: 3, selectedContentIdKey: 'publish.selectedContentId',
          contents: [
            { id: 'g1', title: 'New Library Opening', excerpt: 'Modern facility with digital media lab.', contentType: 'government', author: 'City Press', publishedAt: 'May 23', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=300&fit=crop' },
            { id: 'g2', title: 'Road Construction Updates', excerpt: 'Traffic advisory for downtown area.', contentType: 'news', author: 'Traffic Dept', publishedAt: 'May 22', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop' },
            { id: 'g3', title: 'Community Garden Program', excerpt: 'Apply for a plot in your neighborhood.', contentType: 'government', author: 'Parks Dept', publishedAt: 'May 21', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop' },
          ],
        },
      }),
    },
    {
      x: 0, y: 72, w: 12, h: 8,
      content: JSON.stringify({
        name: 'SubscriptionForm',
        props: {
          title: 'City Alerts & Notifications',
          description: 'Subscribe to receive emergency alerts, meeting notices, and community updates.',
          placeholder: 'Enter your email', buttonLabel: 'Subscribe',
        },
      }),
    },
  ],
};

// ── Book Store Page ───────────────────────────────────────────────

export const BOOK_STORE: SeedPageData = {
  id: 'seed-publish-books',
  type: 'page',
  title: 'Book Store',
  excerpt: 'A comprehensive publications catalog with ranking board, author profiles, series listing, reviews, and featured titles.',
  image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=400&fit=crop',
  status: 'draft',
  attributes: { margin: '0px' },
  pageState: { selectedId: null, keyword: '', activeTab: 'components' },
  layout: [
    {
      x: 0, y: 0, w: 12, h: 14,
      content: JSON.stringify({
        name: 'HeroBanner',
        props: {
          title: 'Chronicle Books',
          subtitle: 'Discover your next great read — from bestsellers to hidden gems.',
          backgroundImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&q=80',
          showSearch: true, searchPlaceholder: 'Search by title, author, or ISBN...',
          keywordKey: 'publish.searchQuery',
          ctaText: 'Browse All',
        },
      }),
    },
    {
      x: 0, y: 14, w: 12, h: 4,
      content: JSON.stringify({
        name: 'SectionNav',
        props: {
          sections: [
            { id: 'b1', name: 'Bestsellers', slug: 'bestsellers', icon: '🏆' },
            { id: 'b2', name: 'Fiction', slug: 'fiction', icon: '📖' },
            { id: 'b3', name: 'Non-Fiction', slug: 'non-fiction', icon: '📘' },
            { id: 'b4', name: 'Children', slug: 'children', icon: '🧸' },
            { id: 'b5', name: 'Manga', slug: 'manga', icon: '🎨' },
          ],
        },
      }),
    },
    {
      x: 0, y: 18, w: 8, h: 16,
      content: JSON.stringify({
        name: 'PublicationGrid',
        props: {
          title: 'Featured Publications', columns: 3,
          publications: [
            { id: 'p1', title: 'The Great Adventure', coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop', author: 'John Smith', publisher: 'Chronicle Books', format: 'Hardcover', price: '$24.99' },
            { id: 'p2', title: 'Digital Horizons', coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop', author: 'Emily Chen', publisher: 'Tech Press', format: 'Paperback', price: '$18.99' },
            { id: 'p3', title: 'The Art of Manga', coverImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=300&fit=crop', author: 'Yuki Tanaka', publisher: 'Manga Arts', format: 'Paperback', price: '$15.99' },
          ],
        },
      }),
    },
    {
      x: 8, y: 18, w: 4, h: 16,
      content: JSON.stringify({
        name: 'RankingBoard',
        props: {
          title: 'Bestsellers',
          description: 'This week\'s top-selling books',
          category: 'Fiction',
          items: [
            { id: 'r1', rank: 1, title: 'Kafka on the Shore', author: 'Haruki Murakami', coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80&h=120&fit=crop', rating: 4.5, previousRank: 2, badge: '#1 NEW' },
            { id: 'r2', rank: 2, title: 'The Great Adventure', author: 'John Smith', coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=80&h=120&fit=crop', rating: 4.3, previousRank: 1 },
            { id: 'r3', rank: 3, title: 'Digital Horizons', author: 'Emily Chen', coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=80&h=120&fit=crop', rating: 4.1, previousRank: 4 },
            { id: 'r4', rank: 4, title: 'The Art of Manga', author: 'Yuki Tanaka', coverImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=80&h=120&fit=crop', rating: 4.0, previousRank: 3 },
          ],
        },
      }),
    },
    {
      x: 0, y: 34, w: 4, h: 14,
      content: JSON.stringify({
        name: 'AuthorProfile',
        props: {
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
        },
      }),
    },
    {
      x: 4, y: 34, w: 4, h: 14,
      content: JSON.stringify({
        name: 'SeriesCard',
        props: {
          title: 'The Wind-Up Bird Chronicle',
          author: 'Haruki Murakami',
          description: 'A three-volume epic exploring memory, identity, and the shadows of war.',
          totalVolumes: 3,
          currentVolume: 2,
          volumes: [
            { id: 'sv1', number: 1, title: 'The Thieving Magpie', coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=180&fit=crop', publishedAt: '1994', pageCount: 368 },
            { id: 'sv2', number: 2, title: 'The Bird as Prophet', coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&h=180&fit=crop', publishedAt: '1995', pageCount: 400 },
            { id: 'sv3', number: 3, title: 'The Bird-Catcher', coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=120&h=180&fit=crop', publishedAt: '1995', pageCount: 384 },
          ],
        },
      }),
    },
    {
      x: 8, y: 34, w: 4, h: 14,
      content: JSON.stringify({
        name: 'ReviewCard',
        props: {
          title: 'A Masterpiece of Modern Literature',
          bookTitle: 'Kafka on the Shore',
          reviewer: 'Literary Review',
          rating: 4.5,
          excerpt: 'Murakami weaves together parallel narratives with masterful precision, creating a work that is at once deeply personal and universally resonant.',
          fullReview: 'Murakami weaves together parallel narratives with masterful precision, creating a work that is at once deeply personal and universally resonant. The author\'s characteristic blend of mundane reality and surreal fantasy reaches new heights here, challenging readers to question the boundaries between dreams and waking life.',
          date: 'June 2026',
          source: 'Literary Review',
          bookImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80&h=120&fit=crop',
        },
      }),
    },
    {
      x: 0, y: 48, w: 12, h: 8,
      content: JSON.stringify({
        name: 'SubscriptionForm',
        props: {
          title: 'Book Lovers Newsletter',
          description: 'Get weekly recommendations, author interviews, and exclusive deals.',
          placeholder: 'your@email.com', buttonLabel: 'Subscribe',
          interestCategories: [
            { id: 'fiction', label: 'Fiction' },
            { id: 'non-fiction', label: 'Non-Fiction' },
            { id: 'comic', label: 'Manga & Comics' },
          ],
        },
      }),
    },
  ],
};

// ── Events Page ───────────────────────────────────────────────────

export const EVENTS_PAGE: SeedPageData = {
  id: 'seed-publish-events',
  type: 'page',
  title: 'Events Calendar',
  excerpt: 'A comprehensive events page with calendar, filter bar, ticket tiers, venue info, schedule timeline, and featured/upcoming events.',
  image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
  status: 'draft',
  attributes: { margin: '0px' },
  pageState: { selectedId: null, keyword: '', activeTab: 'components' },
  layout: [
    {
      x: 0, y: 0, w: 12, h: 14,
      content: JSON.stringify({
        name: 'HeroBanner',
        props: {
          title: 'Events & Entertainment',
          subtitle: 'Discover concerts, festivals, and cultural events in your city.',
          backgroundImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1920&q=80',
          showSearch: true, searchPlaceholder: 'Search events...',
          keywordKey: 'publish.searchQuery',
          badgeText: "WHAT'S ON", badgeColor: 'bg-pink-600',
        },
      }),
    },
    {
      x: 0, y: 14, w: 12, h: 6,
      content: JSON.stringify({
        name: 'EventFilterBar',
        props: {
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
        },
      }),
    },
    {
      x: 0, y: 20, w: 7, h: 16,
      content: JSON.stringify({
        name: 'EventCalendar',
        props: {
          title: 'Events Calendar',
          events: [
            { id: 'ec1', title: 'Summer Music Festival', date: '2026-07-15', time: '10:00', category: 'Music', location: 'Central Park' },
            { id: 'ec2', title: 'Art Exhibition Opening', date: '2026-07-15', time: '18:00', category: 'Art', location: 'City Gallery' },
            { id: 'ec3', title: 'Food Festival', date: '2026-07-20', time: '11:00', category: 'Food' },
            { id: 'ec4', title: 'Jazz Night', date: '2026-07-05', time: '19:30', category: 'Music', location: 'Blue Note Club' },
            { id: 'ec5', title: 'Film Screening: Classics', date: '2026-06-30', time: '20:00', category: 'Film' },
          ],
        },
      }),
    },
    {
      x: 7, y: 20, w: 5, h: 16,
      content: JSON.stringify({
        name: 'TicketCard',
        props: {
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
        },
      }),
    },
    {
      x: 0, y: 36, w: 8, h: 14,
      content: JSON.stringify({
        name: 'ContentGrid',
        props: {
          title: 'Featured Event', columns: 1, selectedContentIdKey: 'publish.selectedContentId',
          contents: [
            { id: 'e0', title: 'Summer Music Festival 2026', excerpt: 'Three-day outdoor music festival featuring top international artists across 5 stages.', contentType: 'entertainment', author: 'Event Guide', publishedAt: 'Jul 15-17', featured: true, image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop' },
          ],
        },
      }),
    },
    {
      x: 8, y: 36, w: 4, h: 14,
      content: JSON.stringify({
        name: 'VenueCard',
        props: {
          name: 'Central Park Great Lawn',
          address: 'Central Park, New York, NY 10024',
          capacity: '60,000',
          access: 'Subway B/C to 81st St or 2/3 to 72nd St — 10 min walk',
          parking: 'Central Park Garage, 65th St & 5th Ave',
          phone: '(212) 360-3444',
          website: 'https://www.centralparknyc.org',
          image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
          mapUrl: 'https://maps.google.com/?q=Central+Park+Great+Lawn',
        },
      }),
    },
    {
      x: 0, y: 50, w: 12, h: 12,
      content: JSON.stringify({
        name: 'ScheduleList',
        props: {
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
        },
      }),
    },
    {
      x: 0, y: 62, w: 12, h: 14,
      content: JSON.stringify({
        name: 'ContentGrid',
        props: {
          title: 'Upcoming Events', columns: 3, selectedContentIdKey: 'publish.selectedContentId',
          contents: [
            { id: 'e1', title: 'Art Exhibition', excerpt: 'Contemporary artists showcase.', contentType: 'entertainment', author: 'Art Guild', publishedAt: 'Jun 1', image: 'https://images.unsplash.com/photo-1531913764164-f85c3e04e714?w=400&h=300&fit=crop' },
            { id: 'e2', title: 'Jazz Night', excerpt: 'Live jazz under the stars.', contentType: 'entertainment', author: 'Music Hall', publishedAt: 'Jun 5', image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=300&fit=crop' },
            { id: 'e3', title: 'Food Festival', excerpt: 'Taste cuisines from 30 countries.', contentType: 'entertainment', author: 'Foodie', publishedAt: 'Jun 10', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop' },
          ],
        },
      }),
    },
    {
      x: 0, y: 76, w: 12, h: 8,
      content: JSON.stringify({
        name: 'SubscriptionForm',
        props: {
          title: 'Stay Updated',
          description: 'Get notified about upcoming events, ticket releases, and festival announcements.',
          placeholder: 'your@email.com', buttonLabel: 'Subscribe',
          interestCategories: [
            { id: 'music', label: 'Music' },
            { id: 'art', label: 'Art' },
            { id: 'food', label: 'Food & Drink' },
          ],
        },
      }),
    },
  ],
};

// ── Japanese Magazine (縦書き雑誌) Page ──────────────────────────

export const JAPANESE_MAGAZINE: SeedPageData = {
  id: 'seed-publish-magazine',
  type: 'page',
  title: 'Japanese Magazine (縦書き)',
  excerpt: 'A magazine-style page featuring vertical writing (縦書き/tategaki) layout with columns, article previews, and traditional Japanese typography.',
  image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop',
  status: 'draft',
  attributes: { margin: '0px' },
  pageState: { selectedId: null, keyword: '', activeTab: 'components' },
  layout: [
    {
      x: 0, y: 0, w: 12, h: 6,
      content: JSON.stringify({
        name: 'WritingModeToggle',
        props: {
          current: 'vertical-rl',
          variant: 'compact',
          position: 'top-right',
          label: 'Reading Mode',
        },
      }),
    },
    {
      x: 0, y: 0, w: 12, h: 18,
      content: JSON.stringify({
        name: 'VerticalArticleCard',
        props: {
          title: '文学の秋 — 日本近代文学の軌跡',
          content: '<p>日本の近代文学は、明治維新以降の西洋文化の流入とともに大きな変革を遂げてきました。夏目漱石や森鴎外といった文豪たちは、伝統的な日本文学の手法に西洋の写実主義を融合させ、独自の文学世界を築き上げました。<ruby>草枕<rt>くさまくら</rt></ruby>に代表されるように、彼らの作品には日本の美意識と西洋の思想が絶妙に調和しています。</p><p>大正時代に入ると、芥川龍之介や谷崎潤一郎といった作家が登場し、より多様なテーマと文体が生まれました。特に谷崎の<ruby>陰翳礼讃<rt>いんえいらいさん</rt></ruby>は、日本文化における陰影の美しさを独自の視点で描き出し、今なお多くの読者を魅了しています。</p><p>昭和時代には、川端康成や三島由紀夫など、国際的に評価される作家が続々と登場。川端は「<ruby>雪国<rt>ゆきぐに</rt></ruby>」でノーベル文学賞を受賞し、日本文学の境界を世界に広げました。</p><p>現代においても、村上春樹をはじめとする作家たちが、日本語の豊かな表現力を活かしながら、グローバルなテーマに挑戦し続けています。縦書きで読む日本語の文章には、独特のリズムと美しさがあり、それが日本文学の大きな魅力の一つです。</p>',
          image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&q=80',
          contentType: 'publication',
          category: '文学 (Literature)',
          author: '文学編集部',
          publishedAt: 'June 11, 2026',
          tags: ['literature', 'japanese', 'tategaki', '縦書き', '文学'],
          columnCount: 2,
          lineWidth: 35,
          seriesName: '日本文化特集',
          chapterNumber: 1,
          totalChapters: 6,
          extraMeta: [
            { label: '号数', value: '2026年7月号' },
            { label: '頁', value: '12-18' },
          ],
        },
      }),
    },
    {
      x: 0, y: 18, w: 6, h: 18,
      content: JSON.stringify({
        name: 'ContentCard',
        props: {
          title: '浮世絵から漫画へ — 日本のビジュアルアートの進化',
          excerpt: '葛飾北斎から現代のマンガまで、日本のビジュアルアート250年の歴史を辿る。',
          image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=400&fit=crop',
          contentType: 'publication',
          category: 'アート',
          author: '美術評論家',
          publishedAt: 'June 11, 2026',
          featured: true,
          selectedContentIdKey: 'publish.selectedContentId',
        },
      }),
    },
    {
      x: 6, y: 18, w: 6, h: 18,
      content: JSON.stringify({
        name: 'ContentCard',
        props: {
          title: '茶道の心 — 和敬静寂の世界',
          excerpt: '千利休が確立した茶道の精神は、現代のビジネスや日常生活にも通じる深い哲学がある。',
          image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=400&fit=crop',
          contentType: 'publication',
          category: '文化',
          author: '茶道研究家',
          publishedAt: 'June 10, 2026',
          selectedContentIdKey: 'publish.selectedContentId',
        },
      }),
    },
    {
      x: 0, y: 36, w: 12, h: 16,
      content: JSON.stringify({
        name: 'RelatedArticles',
        props: {
          title: '関連記事',
          maxArticles: 3,
          columns: 3,
          selectedContentIdKey: 'publish.selectedContentId',
          articles: [
            { id: 'm-1', title: '俳句の世界 — 十七音で紡ぐ宇宙', excerpt: '松尾芭蕉から現代俳人まで、俳句の魅力を探る。', category: '文学', publishedAt: 'June 8', image: 'https://images.unsplash.com/photo-1472173148041-00294f0814a0?w=400&h=225&fit=crop' },
            { id: 'm-2', title: '着物の美 — 日本の伝統色', excerpt: '季節を纏う着物の色と柄に込められた意味。', category: '文化', publishedAt: 'June 5', image: 'https://images.unsplash.com/photo-1545048702-79362696f4e2?w=400&h=225&fit=crop' },
            { id: 'm-3', title: '日本建築の美学', excerpt: '自然と調和する日本建築の原理。', category: 'アート', publishedAt: 'June 3', image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=400&h=225&fit=crop' },
          ],
        },
      }),
    },
    {
      x: 0, y: 52, w: 12, h: 8,
      content: JSON.stringify({
        name: 'SubscriptionForm',
        props: {
          title: '雑誌購読のご案内',
          description: '毎月届く日本文化特集。縦書き美しい本文でお読みいただけます。',
          placeholder: 'メールアドレスを入力',
          buttonLabel: '購読する',
          interestCategories: [
            { id: 'publication', label: '文学' },
            { id: 'comic', label: '漫画' },
            { id: 'entertainment', label: 'イベント' },
          ],
        },
      }),
    },
  ],
};

// ── Newspaper Home Page ──────────────────────────────────────────

export const NEWSPAPER_HOME: SeedPageData = {
  id: 'seed-publish-newspaper',
  type: 'page',
  title: 'Newspaper Home',
  excerpt: 'A professional newspaper homepage with masthead, lead story, section-ed articles, opinion column, and classifieds.',
  image: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&h=400&fit=crop',
  status: 'draft',
  attributes: { margin: '0px' },
  pageState: { selectedId: null, keyword: '', activeTab: 'components' },
  layout: [
    {
      x: 0, y: 0, w: 12, h: 14,
      content: JSON.stringify({
        name: 'NewspaperHeader',
        props: {
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
        },
      }),
    },
    {
      x: 0, y: 14, w: 8, h: 28,
      content: JSON.stringify({
        name: 'LeadStory',
        props: {
          title: 'Global Summit Concludes with Historic Climate Agreement',
          deck: 'World leaders reach landmark accord on emissions reductions, pledging $500 billion in green technology investments over the next decade.',
          content: '<p>In a landmark moment for international cooperation, leaders from 195 nations have signed the most comprehensive climate agreement in history. The accord, reached after two weeks of intensive negotiations in Paris, commits signatories to a 60% reduction in carbon emissions by 2040.</p><p>"This is a turning point for our planet," said the UN Secretary General at the closing ceremony. "For the first time, we have a binding framework that every nation — from the largest industrial powers to the smallest island states — has agreed to uphold."</p>',
          image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=400&fit=crop',
          category: 'International',
          badgeText: 'BREAKING',
          author: 'Sarah Mitchell',
          authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
          publishedAt: 'June 26, 2026',
          columnCount: 2,
          pullQuote: {
            text: 'This is a turning point for our planet. For the first time, we have a binding framework that every nation has agreed to uphold.',
            attribution: 'UN Secretary General',
          },
          tags: ['climate', 'summit', 'international', 'environment'],
        },
      }),
    },
    // ── Sidebar: Briefs + Editorial ──
    // BriefItem 1 — at y:14
    {
      x: 8, y: 14, w: 4, h: 2,
      content: JSON.stringify({
        name: 'BriefItem',
        props: {
          title: 'Nikkei index closes 2.3% higher on tech rally',
          time: '11:30 AM', category: 'Economy',
        },
      }),
    },
    // BriefItem 2 — at y:16
    {
      x: 8, y: 16, w: 4, h: 2,
      content: JSON.stringify({
        name: 'BriefItem',
        props: {
          title: 'New education reform bill passes first reading',
          time: '10:45 AM', category: 'Politics',
        },
      }),
    },
    // BriefItem 3 — at y:18
    {
      x: 8, y: 18, w: 4, h: 2,
      content: JSON.stringify({
        name: 'BriefItem',
        props: {
          title: 'Olympic committee awards 2032 Games to Singapore',
          time: '10:00 AM', isUrgent: true,
        },
      }),
    },
    // BriefItem 4 — at y:20
    {
      x: 8, y: 20, w: 4, h: 2,
      content: JSON.stringify({
        name: 'BriefItem',
        props: {
          title: 'Typhoon alert issued for southern prefectures',
          time: '9:30 AM', isUrgent: true,
        },
      }),
    },
    {
      x: 8, y: 22, w: 4, h: 10,
      content: JSON.stringify({
        name: 'ContentFeed',
        props: {
          title: 'Latest Updates', maxItems: 5,
          items: [
            { id: 'f1', title: 'Markets open higher on economic data', publishedAt: '9:00 AM', summary: 'Nikkei up 1.5%.', contentType: 'news' },
            { id: 'f2', title: 'New environmental regulations announced', publishedAt: '8:30 AM', summary: 'Government unveils climate plan.', contentType: 'news' },
            { id: 'f3', title: 'Bestseller list: Fiction dominates', publishedAt: '8:00 AM', summary: 'Five new titles enter top ten.', contentType: 'publication' },
            { id: 'f4', title: 'Manga adaptation announced', publishedAt: '7:30 AM', summary: 'Popular series gets anime.', contentType: 'comic' },
            { id: 'f5', title: 'Weekend festival lineup released', publishedAt: '7:00 AM', summary: 'Full artist schedule announced.', contentType: 'entertainment' },
          ],
        },
      }),
    },
    {
      x: 8, y: 32, w: 4, h: 12,
      content: JSON.stringify({
        name: 'EditorialCard',
        props: {
          author: 'Maria Gonzalez',
          authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
          authorTitle: 'Senior Editor, Opinion Desk',
          title: 'Democracy Thrives When Citizens Stay Informed',
          excerpt: 'The health of our democracy depends on the willingness of citizens to engage with ideas that challenge their own.',
          publishedAt: 'June 26, 2026',
          label: 'OPINION',
        },
      }),
    },
    // ── Section: Politics ──
    {
      x: 0, y: 42, w: 12, h: 3,
      content: JSON.stringify({
        name: 'SectionHeader',
        props: { title: 'Politics', subtitle: 'National and international political coverage', icon: '🏛️' },
      }),
    },
    {
      x: 0, y: 45, w: 6, h: 8,
      content: JSON.stringify({
        name: 'PrimaryArticleCard',
        props: {
          title: 'New Environmental Regulations Take Effect This Month',
          excerpt: 'Stricter emissions standards for industries begin implementation across all sectors, with a focus on manufacturing and transportation.',
          section: 'Politics', author: 'Emily Chen', publishedAt: 'June 25, 2026',
        },
      }),
    },
    {
      x: 6, y: 45, w: 6, h: 8,
      content: JSON.stringify({
        name: 'PrimaryArticleCard',
        props: {
          title: 'Parliament Debates Major Education Reform Bill',
          excerpt: 'Proposed legislation would introduce sweeping changes to curriculum standards and teacher certification requirements nationwide.',
          section: 'Politics', author: 'Robert Kim', publishedAt: 'June 24, 2026',
        },
      }),
    },
    // ── Section: Culture ──
    {
      x: 0, y: 53, w: 12, h: 3,
      content: JSON.stringify({
        name: 'SectionHeader',
        props: { title: 'Culture', subtitle: 'Arts, heritage, and cultural events', icon: '🎭' },
      }),
    },
    {
      x: 0, y: 56, w: 4, h: 9,
      content: JSON.stringify({
        name: 'SecondaryArticleCard',
        props: {
          title: 'Cultural Heritage Sites Receive UNESCO Recognition',
          excerpt: 'Five new sites in Japan added to World Heritage list.',
          section: 'Culture', author: 'Yuki Sato', publishedAt: 'June 25, 2026',
        },
      }),
    },
    {
      x: 4, y: 56, w: 4, h: 9,
      content: JSON.stringify({
        name: 'SecondaryArticleCard',
        props: {
          title: 'Summer Festival Draws Record Crowds to Downtown',
          excerpt: 'Over 50,000 attendees enjoy three days of music, food, and performances.',
          section: 'Culture', author: 'Event Desk', publishedAt: 'June 24, 2026',
        },
      }),
    },
    {
      x: 8, y: 56, w: 4, h: 9,
      content: JSON.stringify({
        name: 'SecondaryArticleCard',
        props: {
          title: 'New Museum Exhibition Explores Digital Art',
          excerpt: 'Interactive installations blend traditional techniques with modern technology.',
          section: 'Culture', author: 'Arts Weekly', publishedAt: 'June 23, 2026',
        },
      }),
    },
    // ── Pull Quote ──
    {
      x: 0, y: 65, w: 12, h: 6,
      content: JSON.stringify({
        name: 'PullQuote',
        props: {
          text: 'This is a turning point for our planet. For the first time, we have a binding framework that every nation — from the largest industrial powers to the smallest island states — has agreed to uphold.',
          attribution: 'UN Secretary General',
          attributionTitle: 'Closing Ceremony Address, Paris Climate Summit',
          variant: 'large',
        },
      }),
    },
    // ── Breaking News Ticker ──
    {
      x: 0, y: 71, w: 12, h: 6,
      content: JSON.stringify({
        name: 'BreakingNews',
        props: {
          label: 'LIVE', interval: 5000,
          items: [
            { id: 'b1', title: 'G7 finance ministers meeting underway in Paris' },
            { id: 'b2', title: 'Tokyo Metro announces new line extension by 2030' },
            { id: 'b3', title: 'Major tech merger approved by regulators' },
            { id: 'b4', title: 'Typhoon alert issued for southern prefectures' },
          ],
        },
      }),
    },
    // ── Subscription ──
    {
      x: 0, y: 77, w: 12, h: 8,
      content: JSON.stringify({
        name: 'SubscriptionForm',
        props: {
          title: 'Subscribe to The Daily Chronicle',
          description: 'Get unlimited access to award-winning journalism. Delivered daily to your inbox.',
          placeholder: 'Enter your email',
          buttonLabel: 'Subscribe',
          interestCategories: [
            { id: 'news', label: 'Daily News' },
            { id: 'politics', label: 'Politics' },
            { id: 'business', label: 'Business & Economy' },
            { id: 'sports', label: 'Sports' },
            { id: 'culture', label: 'Culture & Arts' },
          ],
        },
      }),
    },
  ],
};

/** All seed pages for the publish module */


// ── World Cup 2026 Special (Newspaper Paper 1: Sports) ────────────────────

export const WORLD_CUP_SPECIAL: SeedPageData = {
  id: 'seed-publish-worldcup',
  type: 'page',
  title: 'World Cup 2026 Special',
  excerpt: 'Comprehensive coverage of the 2026 FIFA World Cup — Ecuador stuns Germany, Japan advances, Brazil cruises, and Cape Verde\'s miracle run.',
  image: 'https://images.unsplash.com/photo-1489944440612-453fc1b6a9a3?w=800&h=400&fit=crop',
  status: 'draft',
  attributes: { margin: '0px' },
  pageState: { selectedId: null, keyword: '', activeTab: 'components' },
  layout: [
    // Masthead
    {
      x: 0, y: 0, w: 12, h: 13,
      content: JSON.stringify({
        name: 'NewspaperHeader',
        props: {
          name: 'The World Cup Herald',
          tagline: 'Your Daily Guide to the Beautiful Game',
          edition: 'World Cup 2026 · Matchday 15',
          variant: 'standard',
          sections: [
            { label: 'Match Reports', slug: 'matches' },
            { label: 'Knockout Preview', slug: 'knockout' },
            { label: 'Stars', slug: 'stars' },
            { label: 'Host Cities', slug: 'hosts' },
            { label: 'Analysis', slug: 'analysis' },
          ],
          weather: { city: 'Kansas City', temp: '28°C', icon: '☀️', condition: 'Clear' },
        },
      }),
    },
    // Lead Story
    {
      x: 0, y: 13, w: 8, h: 26,
      content: JSON.stringify({
        name: 'LeadStory',
        props: {
          title: 'Ecuador Stuns Germany 2-1 in Thriller, Advances to Round of 32',
          deck: 'Nilson Angulo and Gonzalo Plata score as Ecuador produce one of the biggest upsets in World Cup history against four-time champions.',
          content: '<p>In one of the most dramatic nights of the 2026 FIFA World Cup, Ecuador produced a stunning 2-1 victory over Germany to secure their place in the Round of 32. Goals from Nilson Angulo and Gonzalo Plata sent shockwaves through the tournament, with Leroy Sané\'s late strike proving to be a mere consolation for the four-time champions.</p><p>The result, played out in front of 68,000 fans at Arrowhead Stadium in Kansas City, will go down as one of the greatest upsets in World Cup history. Ecuador, who finished as one of the best third-placed teams, have captured the imagination of neutrals worldwide.</p>',
          image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=400&fit=crop',
          category: 'Match Report',
          badgeText: 'BREAKING',
          author: 'Carlos Rodriguez',
          publishedAt: 'June 26, 2026',
          columnCount: 2,
          pullQuote: { text: 'This is the greatest moment in Ecuadorian football history. Our players believed from the first whistle.', attribution: 'Ecuador Head Coach' },
          tags: ['WorldCup2026', 'Ecuador', 'Germany', 'Upset', 'KnockoutStage'],
        },
      }),
    },
    // Sidebar Briefs
    {
      x: 8, y: 13, w: 4, h: 2,
      content: JSON.stringify({ name: 'BriefItem', props: { title: 'Netherlands crowned Group F winners after 3-1 win over Tunisia', time: '10:30 PM', category: 'Group F' } }),
    },
    {
      x: 8, y: 15, w: 4, h: 2,
      content: JSON.stringify({ name: 'BriefItem', props: { title: 'Japan become first Asian team to reach Round of 32 after 1-1 draw with Sweden', time: '8:00 PM', category: 'Group F', isUrgent: true } }),
    },
    {
      x: 8, y: 17, w: 4, h: 2,
      content: JSON.stringify({ name: 'BriefItem', props: { title: 'Brazil cruise past Scotland 3-0 — Vinicius Jr. scores brace', time: '5:30 PM', category: 'Group C' } }),
    },
    {
      x: 8, y: 19, w: 4, h: 2,
      content: JSON.stringify({ name: 'BriefItem', props: { title: 'Turkey stun hosts USA 3-2 in farewell thriller — Arda Güler scores first World Cup goal', time: '3:00 PM', isUrgent: true } }),
    },
    {
      x: 8, y: 21, w: 4, h: 2,
      content: JSON.stringify({ name: 'BriefItem', props: { title: 'Ivory Coast reach knockout stage for first time ever with 2-0 win over Curaçao', time: '11:00 AM', category: 'Group E' } }),
    },
    {
      x: 8, y: 23, w: 4, h: 2,
      content: JSON.stringify({ name: 'BriefItem', props: { title: 'Cape Verde complete miracle group stage — unbeaten in first World Cup appearance', time: '9:00 AM', category: 'Group H' } }),
    },
    // ContentFeed sidebar
    {
      x: 8, y: 25, w: 4, h: 8,
      content: JSON.stringify({
        name: 'ContentFeed',
        props: {
          title: 'Latest Scores', maxItems: 6,
          items: [
            { id: 's1', title: 'France 4-1 Norway: Dembélé hat-trick powers Les Bleus', publishedAt: 'June 26', contentType: 'news' },
            { id: 's2', title: 'Egypt 1-1 Iran: Pharaohs advance alongside Belgium', publishedAt: 'June 26', contentType: 'news' },
            { id: 's3', title: 'Mexico finish perfect group stage — 9 pts, 0 conceded', publishedAt: 'June 25', contentType: 'news' },
            { id: 's4', title: 'South Africa reach R32 for first time, beat South Korea 1-0', publishedAt: 'June 25', contentType: 'news' },
            { id: 's5', title: 'Canada make history — first ever knockout stage appearance', publishedAt: 'June 25', contentType: 'news' },
            { id: 's6', title: 'Neymar makes emotional return for Brazil after 3-year absence', publishedAt: 'June 25', contentType: 'news' },
          ],
        },
      }),
    },
    // Section: Knockout Preview
    {
      x: 0, y: 39, w: 12, h: 3,
      content: JSON.stringify({ name: 'SectionHeader', props: { title: 'Round of 32 Preview', subtitle: 'Knockout stage kicks off July 1 — these are the must-watch clashes', icon: '🏆' } }),
    },
    {
      x: 0, y: 42, w: 4, h: 8,
      content: JSON.stringify({ name: 'SecondaryArticleCard', props: { title: 'Brazil vs Japan: Samba meets Samurai in blockbuster R32 clash', excerpt: 'The five-time champions face Asia\'s best in what promises to be a tactical masterclass.', section: 'Preview', author: 'Takashi Yamamoto', publishedAt: 'June 27, 2026' } }),
    },
    {
      x: 4, y: 42, w: 4, h: 8,
      content: JSON.stringify({ name: 'SecondaryArticleCard', props: { title: 'South Africa vs Canada: Two debutants, one dream', excerpt: 'Both nations make history just by being here — only one can go further.', section: 'Preview', author: 'Michael Okafor', publishedAt: 'June 27, 2026' } }),
    },
    {
      x: 8, y: 42, w: 4, h: 8,
      content: JSON.stringify({ name: 'SecondaryArticleCard', props: { title: 'Netherlands vs Morocco: Oranje face Atlas Lions test', excerpt: 'Morocco look to repeat 2022 semifinal magic against a dominant Dutch side.', section: 'Preview', author: 'Mark van Dijk', publishedAt: 'June 27, 2026' } }),
    },
    // Section: Stars of the Tournament
    {
      x: 0, y: 50, w: 12, h: 3,
      content: JSON.stringify({ name: 'SectionHeader', props: { title: 'Stars of the Tournament', subtitle: 'The players making headlines at World Cup 2026', icon: '⭐' } }),
    },
    {
      x: 0, y: 53, w: 12, h: 16,
      content: JSON.stringify({
        name: 'ContentGrid',
        props: {
          title: 'Golden Ball Contenders', columns: 4, selectedContentIdKey: 'publish.selectedContentId',
          contents: [
            { id: 'p1', title: 'Ousmane Dembélé', excerpt: 'Hat-trick hero against Norway — 5 goals, 3 assists in group stage. France\'s new talisman.', contentType: 'news', author: 'L\'Équipe', publishedAt: 'June 26', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=300&fit=crop' },
            { id: 'p2', title: 'Vinicius Jr.', excerpt: 'Double against Scotland, pace and flair unmatched. Brazil\'s crown jewel shining bright.', contentType: 'news', author: 'Globo Esporte', publishedAt: 'June 25', image: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400&h=300&fit=crop' },
            { id: 'p3', title: 'Gonzalo Plata', excerpt: 'Scored the winner against Germany. Ecuador\'s hero of the tournament so far.', contentType: 'news', author: 'El Universo', publishedAt: 'June 26', image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=400&h=300&fit=crop' },
            { id: 'p4', title: 'Arda Güler', excerpt: 'First World Cup goal at 21 in Turkey\'s emotional farewell win over USA.', contentType: 'news', author: 'Fanatik', publishedAt: 'June 26', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=300&fit=crop' },
          ],
        },
      }),
    },
    // Breaking News Ticker
    {
      x: 0, y: 69, w: 12, h: 4,
      content: JSON.stringify({
        name: 'BreakingNews',
        props: {
          label: 'LIVE', interval: 4000,
          items: [
            { id: 't1', title: 'Round of 32 kicks off July 1 — full schedule released tonight' },
            { id: 't2', title: 'FIFA confirms record 4.2 billion global TV audience for group stage' },
            { id: 't3', title: 'Kansas City breaks World Cup attendance record — 68,000 at Arrowhead' },
            { id: 't4', title: 'VAR controversy: Germany denied late penalty in Ecuador loss' },
          ],
        },
      }),
    },
    // Subscription
    {
      x: 0, y: 73, w: 12, h: 8,
      content: JSON.stringify({
        name: 'SubscriptionForm',
        props: {
          title: 'Get World Cup Updates',
          description: 'Daily match reports, analysis, and knockout stage coverage delivered to your inbox.',
          placeholder: 'Enter your email', buttonLabel: 'Subscribe',
          interestCategories: [
            { id: 'breaking', label: 'Breaking News' },
            { id: 'analysis', label: 'Match Analysis' },
            { id: 'highlights', label: 'Highlights' },
          ],
        },
      }),
    },
  ],
};

// ── AI & Tech Review (Newspaper Paper 2: Technology) ──────────────────────

export const AI_TECH_REVIEW: SeedPageData = {
  id: 'seed-publish-ai-tech',
  type: 'page',
  title: 'AI & Technology Review',
  excerpt: 'In-depth coverage of the AI revolution — OpenAI\'s custom chip, brain-inspired LLMs, China\'s world model, and the shift from language AI to physical AI.',
  image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
  status: 'draft',
  attributes: { margin: '0px' },
  pageState: { selectedId: null, keyword: '', activeTab: 'components' },
  layout: [
    // Masthead
    {
      x: 0, y: 0, w: 12, h: 13,
      content: JSON.stringify({
        name: 'NewspaperHeader',
        props: {
          name: 'The AI Chronicle',
          tagline: 'Tracking the Intelligence Revolution',
          edition: 'June 27, 2026 · Technology Special',
          variant: 'standard',
          sections: [
            { label: 'Hardware', slug: 'hardware' },
            { label: 'Models', slug: 'models' },
            { label: 'Physical AI', slug: 'physical' },
            { label: 'Policy', slug: 'policy' },
            { label: 'Startups', slug: 'startups' },
          ],
          weather: { city: 'San Francisco', temp: '19°C', icon: '☁️', condition: 'Overcast' },
        },
      }),
    },
    // Lead Story: OpenAI Chip
    {
      x: 0, y: 13, w: 8, h: 28,
      content: JSON.stringify({
        name: 'LeadStory',
        props: {
          title: 'OpenAI Launches Jalapeño: First Custom AI Chip Challenges Nvidia Dominance',
          deck: 'Co-developed with Broadcom in just 9 months, the new inference chip delivers breakthrough performance-per-watt and signals a new era of AI hardware independence.',
          content: '<p>OpenAI has unveiled Jalapeño, its first custom-designed AI inference chip, marking a pivotal shift in the AI hardware landscape. Co-developed with Broadcom and Celestica, the chip was designed from scratch in just nine months — one of the fastest ASIC development cycles in semiconductor history.</p><p>Already running GPT-5.3-Codex-Spark in OpenAI\'s labs at target performance, Jalapeño delivers substantially better performance-per-watt than current state-of-the-art hardware, including Nvidia Blackwell and Google TPUs. A multi-generation roadmap is already in place, with initial data center deployment planned by end of 2026.</p>',
          image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
          category: 'Hardware',
          badgeText: 'EXCLUSIVE',
          author: 'Sarah Chen',
          publishedAt: 'June 24, 2026',
          columnCount: 2,
          pullQuote: { text: 'Jalapeño represents the beginning of true AI infrastructure independence. We are no longer dependent on any single supplier for the compute that powers our models.', attribution: 'OpenAI CTO' },
          tags: ['OpenAI', 'AI Chip', 'Jalapeño', 'Broadcom', 'Nvidia'],
        },
      }),
    },
    // Sidebar
    {
      x: 8, y: 13, w: 4, h: 2,
      content: JSON.stringify({ name: 'BriefItem', props: { title: 'BAAI unveils Physis-v0.1 — world\'s first general world foundation model', time: 'June 14', category: 'Models' } }),
    },
    {
      x: 8, y: 15, w: 4, h: 2,
      content: JSON.stringify({ name: 'BriefItem', props: { title: 'WeRide GENESIS wins Generative AI Platform of the Year', time: 'June 25', category: 'Physical AI' } }),
    },
    {
      x: 8, y: 17, w: 4, h: 2,
      content: JSON.stringify({ name: 'BriefItem', props: { title: 'Edge Impulse wins MLOps Innovation Award for edge AI platform', time: 'June 25', category: 'Awards' } }),
    },
    {
      x: 8, y: 19, w: 4, h: 2,
      content: JSON.stringify({ name: 'BriefItem', props: { title: 'TrendLife ScamCheck wins AI Safety Solution of the Year', time: 'June 25', isUrgent: true } }),
    },
    {
      x: 8, y: 21, w: 4, h: 8,
      content: JSON.stringify({
        name: 'ContentFeed',
        props: {
          title: 'Market Watch', maxItems: 5,
          items: [
            { id: 'm1', title: 'Nvidia shares dip 3% after OpenAI chip announcement', publishedAt: '9:30 AM', contentType: 'news' },
            { id: 'm2', title: 'Broadcom stock surges 8% on Jalapeño partnership news', publishedAt: '9:15 AM', contentType: 'news' },
            { id: 'm3', title: 'TSMC confirms 2nm process ready for AI chip production', publishedAt: 'Yesterday', contentType: 'news' },
            { id: 'm4', title: 'AI startup funding hits $42B in Q2 2026 — new record', publishedAt: 'June 25', contentType: 'news' },
            { id: 'm5', title: 'EU AI Act full enforcement begins — what it means for devs', publishedAt: 'June 24', contentType: 'government' },
          ],
        },
      }),
    },
    // Section: Models & Research
    {
      x: 0, y: 41, w: 12, h: 3,
      content: JSON.stringify({ name: 'SectionHeader', props: { title: 'Models & Research', subtitle: 'The latest breakthroughs in AI architecture and capabilities', icon: '🧠' } }),
    },
    {
      x: 0, y: 44, w: 6, h: 10,
      content: JSON.stringify({
        name: 'PrimaryArticleCard',
        props: {
          title: 'EPFL Creates MiCRo: An LLM That Thinks Like the Human Brain',
          excerpt: 'Researchers unveil MiCRo (Mixture of Cognitive Reasoners), a novel LLM architecture divided into four specialized experts modeled after brain regions — language, logic, social reasoning, and world knowledge. Unlike black-box LLMs, MiCRo makes its thinking transparent and steerable without prompting.',
          section: 'Research', author: 'EPFL News', publishedAt: 'June 2026',
        },
      }),
    },
    {
      x: 6, y: 44, w: 6, h: 10,
      content: JSON.stringify({
        name: 'PrimaryArticleCard',
        props: {
          title: 'From Language to Physical AI: China Unveils First General World Foundation Model',
          excerpt: 'Beijing Academy of AI\'s Physis-v0.1 aims to understand physical laws, spatial reasoning, and cause-effect relationships — marking a fundamental shift from text-pattern learning to real-world comprehension essential for robotics and embodied AI.',
          section: 'Physical AI', author: 'CGTN', publishedAt: 'June 14, 2026',
        },
      }),
    },
    // Section: Industry Impact
    {
      x: 0, y: 54, w: 12, h: 3,
      content: JSON.stringify({ name: 'SectionHeader', props: { title: 'Industry & Innovation', subtitle: 'How AI is reshaping businesses and products', icon: '🏭' } }),
    },
    {
      x: 0, y: 57, w: 4, h: 9,
      content: JSON.stringify({ name: 'SecondaryArticleCard', props: { title: 'WeRide GENESIS reduces autonomous driving data costs by 75%', excerpt: 'Four-layer world model architecture powers end-to-end ADAS winning six consecutive championships.', section: 'Autonomous', author: 'GlobeNewswire', publishedAt: 'June 25, 2026' } }),
    },
    {
      x: 4, y: 57, w: 4, h: 9,
      content: JSON.stringify({ name: 'SecondaryArticleCard', props: { title: 'InnoCaption wins Text-to-Speech award for AI-powered accessibility', excerpt: 'AI Refine helps people with speech disabilities communicate on phone calls.', section: 'Accessibility', author: 'TMCnet', publishedAt: 'June 25, 2026' } }),
    },
    {
      x: 8, y: 57, w: 4, h: 9,
      content: JSON.stringify({ name: 'SecondaryArticleCard', props: { title: 'AI coding assistants now write 40% of all production code', excerpt: 'GitHub survey reveals dramatic shift in software development practices.', section: 'DevTools', author: 'TechCrunch', publishedAt: 'June 26, 2026' } }),
    },
    // Opinion
    {
      x: 0, y: 66, w: 4, h: 10,
      content: JSON.stringify({
        name: 'EditorialCard',
        props: {
          author: 'Dr. Yuki Tanaka',
          authorTitle: 'AI Ethics Researcher, MIT',
          title: 'The Chip Race Won\'t Solve AI\'s Real Problems',
          excerpt: 'While OpenAI\'s Jalapeño and Nvidia\'s Blackwell compete for hardware supremacy, we risk overlooking the deeper questions about AI alignment, bias, and the growing digital divide between nations that can afford custom silicon and those that cannot.',
          publishedAt: 'June 26, 2026',
          label: 'OPINION',
        },
      }),
    },
    // Pull Quote
    {
      x: 4, y: 66, w: 8, h: 10,
      content: JSON.stringify({
        name: 'PullQuote',
        props: {
          text: 'The shift from language AI to physical AI is as significant as the shift from rule-based systems to deep learning. It will define the next decade of technological progress.',
          attribution: 'Director, Beijing Academy of AI',
          attributionTitle: 'Physis-v0.1 Launch Keynote',
          variant: 'large',
        },
      }),
    },
    // Subscription
    {
      x: 0, y: 76, w: 12, h: 8,
      content: JSON.stringify({
        name: 'SubscriptionForm',
        props: {
          title: 'Stay Ahead of the Curve',
          description: 'Weekly AI breakthroughs, research papers, and industry analysis delivered every Monday.',
          placeholder: 'your@email.com', buttonLabel: 'Subscribe',
          interestCategories: [
            { id: 'research', label: 'Research' },
            { id: 'hardware', label: 'Hardware' },
            { id: 'policy', label: 'AI Policy' },
          ],
        },
      }),
    },
  ],
};

// ── Travel Magazine ───────────────────────────────────────────────────

export const TRAVEL_MAGAZINE: SeedPageData = {
  id: 'seed-publish-travel',
  type: 'page',
  title: 'Wanderlust Magazine — Summer 2026',
  excerpt: 'Discover the world\'s hottest destinations for summer 2026 — from Japan\'s cultural renaissance to Mediterranean bliss, Nordic escapes, and World Cup host cities.',
  image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
  status: 'draft',
  attributes: { margin: '0px' },
  pageState: { selectedId: null, keyword: '', activeTab: 'components' },
  layout: [
    // Hero
    {
      x: 0, y: 0, w: 12, h: 14,
      content: JSON.stringify({
        name: 'HeroBanner',
        props: {
          title: 'Wanderlust',
          subtitle: 'Summer 2026 — Where the World is Going This Year',
          backgroundImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80',
          showSearch: true, searchPlaceholder: 'Search destinations, guides, tips...',
          keywordKey: 'publish.searchQuery',
          badgeText: 'SUMMER 2026',
        },
      }),
    },
    // Section Nav
    {
      x: 0, y: 14, w: 12, h: 5,
      content: JSON.stringify({
        name: 'SectionNav',
        props: {
          sections: [
            { id: 't1', name: 'Asia Rising', slug: 'asia', icon: '🏯' },
            { id: 't2', name: 'Mediterranean', slug: 'mediterranean', icon: '🏖️' },
            { id: 't3', name: 'Nordic Escape', slug: 'nordic', icon: '❄️' },
            { id: 't4', name: 'Hidden Gems', slug: 'hidden', icon: '💎' },
            { id: 't5', name: 'World Cup Cities', slug: 'worldcup', icon: '⚽' },
          ],
        },
      }),
    },
    // Featured: Japan
    {
      x: 0, y: 19, w: 8, h: 18,
      content: JSON.stringify({
        name: 'FeaturedContent',
        props: {
          title: 'Japan Rises: The World\'s #2 Travel Destination',
          excerpt: 'Tokyo was the most-mentioned city destination worldwide in 2026. From ancient temples to neon-lit streets, Japan\'s cultural renaissance is drawing record visitors. Holafly data shows Japan climbing to #2 globally, with 46.4% of travelers now planning international trips.',
          image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=600&fit=crop',
          category: 'Asia',
          author: 'Emma Williams',
          publishedAt: 'June 25, 2026',
          badgeText: 'TRENDING #1',
        },
      }),
    },
    {
      x: 8, y: 19, w: 4, h: 18,
      content: JSON.stringify({
        name: 'LatestUpdates',
        props: {
          title: 'Travel Alerts', maxItems: 6, showViewAll: true,
          items: [
            { id: 'ta1', title: 'Japan e-visa now available in 68 countries — processing time under 48 hours', publishedAt: '2h ago', contentType: 'news' },
            { id: 'ta2', title: 'EU launches digital Schengen visa — 27 countries, one app', publishedAt: '5h ago', contentType: 'government' },
            { id: 'ta3', title: 'Airfare to Nordic cities drops 20% as airlines add summer routes', publishedAt: '1d ago', contentType: 'news' },
            { id: 'ta4', title: 'World Cup host cities see hotel prices surge 300% for knockout stage', publishedAt: '1d ago', contentType: 'news' },
            { id: 'ta5', title: 'Croatia joins Schengen fully — no more border checks at airports', publishedAt: '2d ago', contentType: 'government' },
            { id: 'ta6', title: 'Airbnb launches \"Hidden Gems\" filter — 50+ under-the-radar destinations', publishedAt: '3d ago', contentType: 'news' },
          ],
        },
      }),
    },
    // Mediterranean Section
    {
      x: 0, y: 37, w: 12, h: 3,
      content: JSON.stringify({ name: 'SectionHeader', props: { title: 'Mediterranean Bliss', subtitle: 'Greece leads Spain and Italy in 2026 tourism surge', icon: '🏖️' } }),
    },
    {
      x: 0, y: 40, w: 4, h: 16,
      content: JSON.stringify({ name: 'ContentCard', props: { title: 'Santorini Secrets', excerpt: 'Beyond the famous blue domes — hidden beaches, local tavernas, and the best sunset spots away from crowds.', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&h=400&fit=crop', contentType: 'entertainment', category: 'Greece', author: 'Maria K.', publishedAt: 'June 20', selectedContentIdKey: 'publish.selectedContentId' } }),
    },
    {
      x: 4, y: 40, w: 4, h: 16,
      content: JSON.stringify({ name: 'ContentCard', props: { title: 'Alicante: Europe\'s #1 Trending Spot', excerpt: 'Why this Spanish coastal gem is topping every travel list in 2026 — food, beaches, and perfect weather.', image: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae2?w=600&h=400&fit=crop', contentType: 'entertainment', category: 'Spain', author: 'Carlos Ruiz', publishedAt: 'June 18', selectedContentIdKey: 'publish.selectedContentId' } }),
    },
    {
      x: 8, y: 40, w: 4, h: 16,
      content: JSON.stringify({ name: 'ContentCard', props: { title: 'Ksamil: Albania\'s Hidden Paradise', excerpt: 'Crystal-clear waters at half the price of Greece. The Balkans\' best-kept secret is out.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', contentType: 'entertainment', category: 'Albania', author: 'Anna Petrova', publishedAt: 'June 15', selectedContentIdKey: 'publish.selectedContentId' } }),
    },
    // Nordic Escape
    {
      x: 0, y: 56, w: 12, h: 3,
      content: JSON.stringify({ name: 'SectionHeader', props: { title: 'Nordic Escape', subtitle: 'Cooler climes surge — Oslo +154%, Helsinki +124%, Stockholm +90%', icon: '❄️' } }),
    },
    {
      x: 0, y: 59, w: 6, h: 10,
      content: JSON.stringify({
        name: 'PrimaryArticleCard',
        props: {
          title: 'Why Everyone is Fleeing to Scandinavia This Summer',
          excerpt: 'Record heatwaves across Southern Europe and the US are driving a massive shift toward Nordic destinations. Oslo, Helsinki, Stockholm, and Copenhagen are seeing unprecedented booking surges as travelers seek milder temperatures and breathtaking natural beauty.',
          section: 'Trending', author: 'Lars Nilsson', publishedAt: 'June 22, 2026',
        },
      }),
    },
    {
      x: 6, y: 59, w: 6, h: 10,
      content: JSON.stringify({
        name: 'PrimaryArticleCard',
        props: {
          title: 'Iceland Summer: Midnight Sun Adventures Without the Crowds',
          excerpt: 'With the Ring Road fully upgraded and new eco-lodges opening along the south coast, 2026 is the perfect year to experience Iceland\'s otherworldly landscapes under 24-hour daylight.',
          section: 'Adventure', author: 'Björk Guðmundsdóttir', publishedAt: 'June 20, 2026',
        },
      }),
    },
    // World Cup Cities
    {
      x: 0, y: 69, w: 12, h: 3,
      content: JSON.stringify({ name: 'SectionHeader', props: { title: 'World Cup City Guides', subtitle: 'Host cities seeing massive tourism spikes — plan your football pilgrimage', icon: '⚽' } }),
    },
    {
      x: 0, y: 72, w: 12, h: 16,
      content: JSON.stringify({
        name: 'ContentGrid',
        props: {
          title: 'Top Host Cities to Visit', columns: 4, selectedContentIdKey: 'publish.selectedContentId',
          contents: [
            { id: 'wc1', title: 'Kansas City', excerpt: 'BBQ capital + World Cup record crowds. Searches up 700%.', contentType: 'news', author: 'Travel Guide', publishedAt: 'June 26', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop' },
            { id: 'wc2', title: 'Philadelphia', excerpt: 'Historic charm meets football fever. Searches up 210%.', contentType: 'news', author: 'Travel Guide', publishedAt: 'June 26', image: 'https://images.unsplash.com/photo-1605106702734-205df224ecce?w=400&h=300&fit=crop' },
            { id: 'wc3', title: 'Atlanta', excerpt: 'Southern hospitality with world-class stadiums. Searches up 200%.', contentType: 'news', author: 'Travel Guide', publishedAt: 'June 26', image: 'https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?w=400&h=300&fit=crop' },
            { id: 'wc4', title: 'Monterrey', excerpt: 'Mexican passion for football in a stunning mountain setting. Up 210%.', contentType: 'news', author: 'Travel Guide', publishedAt: 'June 26', image: 'https://images.unsplash.com/photo-1585468274952-66591eb14165?w=400&h=300&fit=crop' },
          ],
        },
      }),
    },
    // Subscription
    {
      x: 0, y: 88, w: 12, h: 8,
      content: JSON.stringify({
        name: 'SubscriptionForm',
        props: {
          title: 'Get Wanderlust Weekly',
          description: 'Destination guides, travel tips, and exclusive deals delivered to your inbox every Friday.',
          placeholder: 'your@email.com', buttonLabel: 'Subscribe',
          interestCategories: [
            { id: 'asia', label: 'Asia' },
            { id: 'europe', label: 'Europe' },
            { id: 'americas', label: 'Americas' },
          ],
        },
      }),
    },
  ],
};

const prepareProductionPage = (page: SeedPageData): SeedPageData => {
  const layout = wirePublishingLayout(page.layout);
  return {
    ...page,
    status: 'draft',
    pageState: createPublishingPageState(page.pageState),
    layout,
    source: createPublishingPageSource(layout),
  };
};

export const PUBLISH_SEED_PAGES: SeedPageData[] = [
  NEWS_HOME,
  MANGA_BROWSER,
  GOV_PORTAL,
  BOOK_STORE,
  EVENTS_PAGE,
  JAPANESE_MAGAZINE,
].map(prepareProductionPage);

export const PUBLISH_SHOWCASE_PAGES: SeedPageData[] = [
  NEWSPAPER_HOME,
  WORLD_CUP_SPECIAL,
  AI_TECH_REVIEW,
  TRAVEL_MAGAZINE,
];

export const PUBLISH_ALL_SAMPLE_PAGES: SeedPageData[] = [
  ...PUBLISH_SEED_PAGES,
  ...PUBLISH_SHOWCASE_PAGES,
];
