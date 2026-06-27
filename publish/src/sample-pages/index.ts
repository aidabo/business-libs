import type { GridStackWidget } from 'gridstack';

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
        name: 'VerticalArticle',
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
export const PUBLISH_SEED_PAGES: SeedPageData[] = [
  NEWS_HOME,
  MANGA_BROWSER,
  GOV_PORTAL,
  BOOK_STORE,
  EVENTS_PAGE,
  JAPANESE_MAGAZINE,
  NEWSPAPER_HOME,
];
